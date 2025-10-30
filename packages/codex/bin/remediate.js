#!/usr/bin/env node
/**
 * Minimal Codex remediation skeleton.
 * - Reads gl-sast-report.json
 * - Filters high/critical findings
 * - Sends a careful prompt to OpenAI to produce a unified diff (minimal fix)
 * - Writes patches to ./codex_patches and attempts git apply
 *
 * NOTE: This is a starting template. Harden prompts and validation before
 * running on a production repo.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import minimist from 'minimist';
import OpenAI from 'openai';

const argv = minimist(process.argv.slice(2));
const sastPath = argv.s || argv.report || 'gl-sast-report.json';
const outDir = argv.o || 'codex_patches';
const openaiKey = process.env.OPENAI_API_KEY;

if (!openaiKey) {
  console.error('OPENAI_API_KEY not set; aborting.');
  process.exit(2);
}

const client = new OpenAI({ apiKey: openaiKey });

async function run() {
  if (!fs.existsSync(sastPath)) {
    console.log(`SAST report not found at ${sastPath}`);
    process.exit(0);
  }
  const report = JSON.parse(fs.readFileSync(sastPath, 'utf8'));
  const findings = (report.findings || []).filter(f =>
    ['HIGH', 'CRITICAL', 'high', 'critical'].includes(String(f.severity).toUpperCase())
  );

  if (!findings.length) {
    console.log('No high/critical findings.');
    return;
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const [i, f] of findings.entries()) {
    try {
      const filePath = path.resolve(f.file || f.filePath || f.location?.file || '');
      const fileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
      const prompt = [
        `Project path: ${process.cwd()}`,
        `SAST finding (${i + 1}/${findings.length}): ${JSON.stringify(f, null, 2)}`,
        `File content:\n${fileContent.slice(0, 2000)}`, // trim large files
        "Deliverable: a minimal unified diff patch (git-style) that fixes only the reported issue.",
        "Constraints: do not change unrelated code, include short justification in comments, do not perform broad refactors.",
        "Output: only the unified diff; do not include anything else."
      ].join('\n\n');

      console.log(`Requesting patch from OpenAI for ${filePath || f}`);
      const resp = await client.chat.completions.create({
        model: 'gpt-4o-mini', // choose preferred model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      });

      const patch = resp.choices?.[0]?.message?.content?.trim() ?? '';
      if (!patch) {
        console.warn('Empty patch — skipping.');
        continue;
      }

      const outFile = path.join(outDir, `${i + 1}-${path.basename(filePath || 'finding')}.diff`);
      fs.writeFileSync(outFile, patch, 'utf8');
      console.log(`Wrote patch: ${outFile}`);

      // Try to apply the patch (best-effort)
      try {
        execSync(`git apply --whitespace=fix ${outFile}`, { stdio: 'inherit' });
        console.log('Patch applied successfully (git apply).');
      } catch (err) {
        console.warn('Patch failed to apply cleanly (git apply) — leaving patch file for manual review.');
      }
    } catch (err) {
      console.error('Error processing finding:', err.message || err);
    }
  }
}

run().catch(err => {
  console.error('Unhandled error', err);
  process.exit(1);
});
