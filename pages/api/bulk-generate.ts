import { GoogleGenerativeAI } from '@google/generative-ai';
import { withAuth, checkUsageLimit, incrementUsage, recordGeneration, AuthenticatedRequest } from '../../src/lib/auth';
import type { NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';

/**
 * Bulk CSV Generation
 *
 * Upload CSV with products and generate ads in bulk
 *
 * POST /api/bulk-generate
 * Headers: { Authorization: Bearer <token> }
 * Body: FormData with CSV file
 *
 * CSV Format:
 * product,audience,tone
 * "AI Marketing Platform","Small businesses","professional"
 * "Fitness App","Gym enthusiasts","exciting"
 */

export const config = {
  api: {
    bodyParser: false,
  },
};

interface BulkRow {
  product: string;
  audience: string;
  tone: string;
}

interface BulkResult {
  success: boolean;
  row: number;
  product: string;
  headline?: string;
  body?: string;
  imagePrompt?: string;
  error?: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = req.user!;

    // Check if user has Pro or Enterprise plan
    if (user.plan === 'free') {
      return res.status(403).json({
        error: 'Bulk generation requires Pro or Enterprise plan',
        message: 'Upgrade to access bulk CSV generation',
        upgrade_url: '/pricing',
      });
    }

    // Parse form data
    const form = new IncomingForm();
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const csvFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!csvFile) {
      return res.status(400).json({
        error: 'No CSV file uploaded',
      });
    }

    // Read CSV
    const csvContent = await fs.readFile(csvFile.filepath, 'utf-8');
    const rows = parseCSV(csvContent);

    if (rows.length === 0) {
      return res.status(400).json({
        error: 'CSV file is empty or invalid',
      });
    }

    // Check usage limit
    const usageCheck = await checkUsageLimit(user.id);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: usageCheck.reason,
        upgrade_url: '/pricing',
      });
    }

    // Limit rows based on plan
    const maxRows = user.plan === 'enterprise' ? 1000 : 100;
    const limitedRows = rows.slice(0, maxRows);

    if (limitedRows.length < rows.length) {
      console.warn(`Truncated CSV from ${rows.length} to ${maxRows} rows for ${user.plan} plan`);
    }

    // Check if user has enough quota
    const remaining = usageCheck.remaining === -1 ? Infinity : usageCheck.remaining!;
    if (remaining < limitedRows.length) {
      return res.status(429).json({
        error: 'Insufficient quota',
        message: `You need ${limitedRows.length} generations but only have ${remaining} remaining today`,
        upgrade_url: '/pricing',
      });
    }

    // Process in batches
    const results: BulkResult[] = [];
    const batchSize = 5;

    for (let i = 0; i < limitedRows.length; i += batchSize) {
      const batch = limitedRows.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((row, batchIndex) =>
          generateForRow(row, i + batchIndex + 1, user.id)
        )
      );
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < limitedRows.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Count successful generations for usage tracking
    const successCount = results.filter((r) => r.success).length;

    // Increment usage by successful generations
    for (let i = 0; i < successCount; i++) {
      await incrementUsage(user.id);
    }

    const successRate = (successCount / results.length) * 100;

    return res.status(200).json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: results.length - successCount,
          successRate: `${successRate.toFixed(1)}%`,
        },
      },
      usage: {
        used: successCount,
        remaining:
          user.daily_limit === -1
            ? 'unlimited'
            : Math.max(0, user.daily_limit - (user.daily_usage + successCount)),
      },
    });
  } catch (error) {
    console.error('Bulk generation error:', error);
    return res.status(500).json({
      error: 'Failed to process bulk generation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default withAuth(handler);

/**
 * Parse CSV content
 */
function parseCSV(content: string): BulkRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const rows: BulkRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));

    if (values.length >= 3) {
      rows.push({
        product: values[0],
        audience: values[1],
        tone: values[2] || 'professional',
      });
    }
  }

  return rows;
}

/**
 * Generate ad for a single row
 */
async function generateForRow(
  row: BulkRow,
  rowNumber: number,
  userId: string
): Promise<BulkResult> {
  try {
    const { product, audience, tone } = row;

    if (!product || !audience) {
      return {
        success: false,
        row: rowNumber,
        product: product || 'Unknown',
        error: 'Missing product or audience',
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback
      const result = {
        success: true,
        row: rowNumber,
        product,
        headline: `Transform Your Experience with ${product}`,
        body: `Discover how ${product} can revolutionize the way ${audience} approach their daily challenges.`,
        imagePrompt: `Professional advertising image for ${product}, targeting ${audience}, ${tone} style`,
      };

      await recordGeneration({
        userId,
        product,
        audience,
        tone,
        headline: result.headline,
        body: result.body,
        imagePrompt: result.imagePrompt,
        model: 'bulk-generation-fallback',
      });

      return result;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Use Flash for speed

    const prompt = `Generate ad creative:
Product: ${product}
Audience: ${audience}
Tone: ${tone}

JSON format:
{"headline": "...", "body": "...", "imagePrompt": "..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let creative;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      creative = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      creative = null;
    }

    if (!creative) {
      creative = {
        headline: `${product} for ${audience}`,
        body: text.substring(0, 200),
        imagePrompt: `${product} ad for ${audience}, ${tone}`,
      };
    }

    // Record in history
    await recordGeneration({
      userId,
      product,
      audience,
      tone,
      headline: creative.headline,
      body: creative.body,
      imagePrompt: creative.imagePrompt,
      model: 'gemini-1.5-flash-bulk',
    });

    return {
      success: true,
      row: rowNumber,
      product,
      headline: creative.headline,
      body: creative.body,
      imagePrompt: creative.imagePrompt,
    };
  } catch (error) {
    console.error(`Row ${rowNumber} error:`, error);
    return {
      success: false,
      row: rowNumber,
      product: row.product,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}
