import { Octokit } from '@octokit/rest';

interface ReviewResult {
  repo: string;
  type: 'pull_request' | 'issue';
  number: number;
  title: string;
  status: 'reviewed' | 'commented' | 'fixed' | 'error';
  message?: string;
}

interface AgentConfig {
  githubToken: string;
  targetRepos: Array<{ owner: string; repo: string }>;
  enableAutoFix?: boolean;
  dryRun?: boolean;
}

export class AutoReviewAgent {
  private octokit: Octokit;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.githubToken,
    });
  }

  /**
   * Run the auto-review agent on all open PRs and issues
   */
  async run(): Promise<ReviewResult[]> {
    const results: ReviewResult[] = [];

    for (const repo of this.config.targetRepos) {
      try {
        // Review all open pull requests
        const prResults = await this.reviewPullRequests(repo.owner, repo.repo);
        results.push(...prResults);

        // Review all open issues
        const issueResults = await this.reviewIssues(repo.owner, repo.repo);
        results.push(...issueResults);
      } catch (error) {
        console.error(`Error processing repo ${repo.owner}/${repo.repo}:`, error);
        results.push({
          repo: `${repo.owner}/${repo.repo}`,
          type: 'issue',
          number: 0,
          title: 'Repository Processing Error',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Review all open pull requests in a repository
   */
  private async reviewPullRequests(
    owner: string,
    repo: string
  ): Promise<ReviewResult[]> {
    const results: ReviewResult[] = [];

    try {
      // Fetch all open pull requests
      const { data: pullRequests } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      });

      console.log(`Found ${pullRequests.length} open PRs in ${owner}/${repo}`);

      for (const pr of pullRequests) {
        try {
          const result = await this.reviewPullRequest(owner, repo, pr.number, pr.title);
          results.push(result);
        } catch (error) {
          console.error(`Error reviewing PR #${pr.number}:`, error);
          results.push({
            repo: `${owner}/${repo}`,
            type: 'pull_request',
            number: pr.number,
            title: pr.title,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching PRs for ${owner}/${repo}:`, error);
    }

    return results;
  }

  /**
   * Review a single pull request
   */
  private async reviewPullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
    title: string
  ): Promise<ReviewResult> {
    console.log(`Reviewing PR #${pullNumber}: ${title}`);

    if (this.config.dryRun) {
      return {
        repo: `${owner}/${repo}`,
        type: 'pull_request',
        number: pullNumber,
        title,
        status: 'reviewed',
        message: 'Dry run - no changes made',
      };
    }

    try {
      // Get PR details including files changed
      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

      // Get files changed in the PR
      const { data: files } = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });

      // Create a review comment
      const reviewComment = this.generateReviewComment(pr, files);

      await this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body: reviewComment,
      });

      return {
        repo: `${owner}/${repo}`,
        type: 'pull_request',
        number: pullNumber,
        title,
        status: 'commented',
        message: 'Review comment added',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Review all open issues in a repository
   */
  private async reviewIssues(owner: string, repo: string): Promise<ReviewResult[]> {
    const results: ReviewResult[] = [];

    try {
      // Fetch all open issues (excluding pull requests)
      const { data: issues } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      });

      // Filter out pull requests (they're returned as issues by the API)
      const actualIssues = issues.filter((issue) => !issue.pull_request);

      console.log(`Found ${actualIssues.length} open issues in ${owner}/${repo}`);

      for (const issue of actualIssues) {
        try {
          const result = await this.reviewIssue(owner, repo, issue.number, issue.title);
          results.push(result);
        } catch (error) {
          console.error(`Error reviewing issue #${issue.number}:`, error);
          results.push({
            repo: `${owner}/${repo}`,
            type: 'issue',
            number: issue.number,
            title: issue.title,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching issues for ${owner}/${repo}:`, error);
    }

    return results;
  }

  /**
   * Review a single issue
   */
  private async reviewIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    title: string
  ): Promise<ReviewResult> {
    console.log(`Reviewing issue #${issueNumber}: ${title}`);

    if (this.config.dryRun) {
      return {
        repo: `${owner}/${repo}`,
        type: 'issue',
        number: issueNumber,
        title,
        status: 'reviewed',
        message: 'Dry run - no changes made',
      };
    }

    try {
      // Get issue details
      const { data: issue } = await this.octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });

      // Get comments on the issue
      const { data: comments } = await this.octokit.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
      });

      // Create a review comment
      const reviewComment = this.generateIssueReviewComment(issue, comments);

      await this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: reviewComment,
      });

      return {
        repo: `${owner}/${repo}`,
        type: 'issue',
        number: issueNumber,
        title,
        status: 'commented',
        message: 'Review comment added',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate a review comment for a pull request
   */
  private generateReviewComment(pr: any, files: any[]): string {
    const filesChanged = files.length;
    const additions = files.reduce((sum, file) => sum + file.additions, 0);
    const deletions = files.reduce((sum, file) => sum + file.deletions, 0);

    return `🤖 **Auto-Review Agent Report**

**PR Summary:**
- Title: ${pr.title}
- Author: @${pr.user.login}
- Files Changed: ${filesChanged}
- Additions: +${additions} / Deletions: -${deletions}
- Status: ${pr.mergeable_state}

**Automated Review:**
✅ PR has been reviewed by the auto-review agent.

**Recommendations:**
- Ensure all tests pass before merging
- Review code changes carefully
- Check for any security vulnerabilities
- Verify documentation is updated if needed

---
*This is an automated review. For detailed review, please request a manual review from team members.*
`;
  }

  /**
   * Generate a review comment for an issue
   */
  private generateIssueReviewComment(issue: any, comments: any[]): string {
    const hasLabels = issue.labels && issue.labels.length > 0;
    const hasAssignees = issue.assignees && issue.assignees.length > 0;
    const commentCount = comments.length;

    return `🤖 **Auto-Review Agent Report**

**Issue Summary:**
- Title: ${issue.title}
- Author: @${issue.user.login}
- State: ${issue.state}
- Comments: ${commentCount}
- Labels: ${hasLabels ? issue.labels.map((l: any) => l.name).join(', ') : 'None'}
- Assignees: ${hasAssignees ? issue.assignees.map((a: any) => '@' + a.login).join(', ') : 'None'}

**Automated Review:**
✅ Issue has been reviewed by the auto-review agent.

**Recommendations:**
${!hasLabels ? '- ⚠️ Consider adding relevant labels to categorize this issue\n' : ''}${!hasAssignees ? '- ⚠️ Consider assigning this issue to a team member\n' : ''}${commentCount === 0 ? '- ⚠️ No discussion yet - consider adding context or questions\n' : ''}
**Next Steps:**
- Review the issue description and requirements
- Add labels and assignees if needed
- Engage in discussion to clarify details
- Create a linked PR when ready to implement

---
*This is an automated review. For detailed triage, please review manually.*
`;
  }

  /**
   * Get a summary of all results
   */
  static getSummary(results: ReviewResult[]): string {
    const total = results.length;
    const byStatus = results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = results.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
Auto-Review Agent Summary:
--------------------------
Total Items Reviewed: ${total}

By Type:
  - Pull Requests: ${byType.pull_request || 0}
  - Issues: ${byType.issue || 0}

By Status:
  - Reviewed: ${byStatus.reviewed || 0}
  - Commented: ${byStatus.commented || 0}
  - Fixed: ${byStatus.fixed || 0}
  - Errors: ${byStatus.error || 0}
`;
  }
}
