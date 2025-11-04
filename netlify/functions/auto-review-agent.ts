import type { Handler } from '@netlify/functions';
import { AutoReviewAgent } from '../../agents/github-pr-manager/src/auto-review-agent';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

export const handler: Handler = async (event) => {
  const startTime = Date.now();

  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed. Use POST or GET.' }),
      };
    }

    // Check if GitHub token is configured
    if (!GITHUB_TOKEN) {
      console.error('GitHub token not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'GitHub token not configured',
          message: 'Please set GITHUB_TOKEN or GITHUB_PERSONAL_ACCESS_TOKEN in Netlify environment variables',
        }),
      };
    }

    console.log('Starting auto-review agent...');

    // Initialize the agent with configuration
    const agent = new AutoReviewAgent({
      githubToken: GITHUB_TOKEN,
      targetRepos: [
        { owner: 'brandonlacoste9-tech', repo: 'adgenxai' },
        { owner: 'brandonlacoste9-tech', repo: 'Beehive' },
      ],
      enableAutoFix: true,
      dryRun: false,
    });

    // Run the agent
    const results = await agent.run();

    const duration = Date.now() - startTime;
    const summary = AutoReviewAgent.getSummary(results);

    console.log('Auto-review agent completed');
    console.log(summary);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Auto-review agent completed successfully',
        duration: `${(duration / 1000).toFixed(2)}s`,
        summary,
        results: results.map((r) => ({
          repo: r.repo,
          type: r.type,
          number: r.number,
          title: r.title,
          status: r.status,
          message: r.message,
        })),
      }),
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('Auto-review agent failed:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'Auto-review agent failed',
        message: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        duration: `${(duration / 1000).toFixed(2)}s`,
      }),
    };
  }
};
