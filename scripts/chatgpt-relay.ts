import OpenAI from "openai";

// Initialize OpenAI client with ChatGPT Business API key
const client = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface DeployData {
  commits: string;
  deployUrl: string;
  buildStatus: string;
  changedFiles: string[];
  telemetryLogs?: string;
}

/**
 * Sends deploy summary to ChatGPT Business (GPT-5) for analysis
 */
export async function summarizeDeploy(data: DeployData): Promise<string> {
  try {
    const prompt = `
Analyze this Beehive deployment:

COMMITS:
${data.commits}

DEPLOY URL: ${data.deployUrl}
BUILD STATUS: ${data.buildStatus}

CHANGED FILES:
${data.changedFiles.map(f => `- ${f}`).join('\n')}

${data.telemetryLogs ? `TELEMETRY:\n${data.telemetryLogs}` : ''}

Provide a concise summary (3-5 bullet points) highlighting:
1. Key changes in this deployment
2. Potential issues or risks
3. Suggested next steps or improvements
    `.trim();

    const response = await client.chat.completions.create({
      model: "gpt-4o", // Use gpt-5 when available on your plan
      messages: [
        { 
          role: "system", 
          content: "You are the Codex sync assistant for Beehive, an AI-powered ad generation platform. Analyze deployments and provide actionable insights." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = response.choices[0]?.message?.content || "No summary generated";
    
    console.log('✅ ChatGPT analysis complete');
    return summary;

  } catch (error) {
    console.error('❌ ChatGPT relay failed:', error);
    throw error;
  }
}

/**
 * Sync latest commit to ChatGPT for continuous monitoring
 */
export async function syncToChatGPT(): Promise<void> {
  const { execSync } = await import("child_process");
  
  try {
    // Get latest commit
    const commits = execSync("git log -1 --pretty=format:'%h %s (%an)'").toString();
    
    // Get Netlify deploy URL
    const deployUrl = process.env.NETLIFY_URL || process.env.DEPLOY_URL || "unknown";
    
    // Get changed files
    const changedFiles = execSync("git diff --name-only HEAD~1 HEAD").toString().split('\n').filter(Boolean);
    
    // Get deployment status
    const buildStatus = process.env.BUILD_STATUS || "success";

    // Send to ChatGPT for analysis
    const summary = await summarizeDeploy({
      commits,
      deployUrl,
      buildStatus,
      changedFiles
    });

    console.log('\n📊 ChatGPT Analysis:\n', summary);

    // Optionally store the summary
    if (process.env.STORE_SUMMARIES === 'true') {
      const fs = await import('fs/promises');
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      await fs.writeFile(
        `logs/chatgpt-summary-${timestamp}.txt`,
        summary,
        'utf-8'
      );
    }

  } catch (error) {
    console.error('❌ ChatGPT sync failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  syncToChatGPT();
}

export { DeployData };
