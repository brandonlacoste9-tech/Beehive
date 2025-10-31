import { SwarmDispatcher } from './dispatcher';
import { TelemetryLogger } from './telemetry';

export interface RoutingResult {
  success: boolean;
  taskId?: string;
  reason?: string;
}

export class EventRouter {
  private dispatcher: SwarmDispatcher;
  private telemetry: TelemetryLogger;

  constructor(telemetry: TelemetryLogger) {
    this.telemetry = telemetry;
    this.dispatcher = new SwarmDispatcher(telemetry);
  }

  async route(eventType: string, payload: Record<string, unknown>): Promise<RoutingResult> {
    this.telemetry.log('router', 'routing_event', { eventType, action: (payload as Record<string, unknown>)?.action });

    switch (eventType) {
      case 'push':
        return this.handlePush(payload);
      case 'pull_request':
        return this.handlePullRequest(payload);
      case 'pull_request_review':
        return this.handlePullRequestReview(payload);
      case 'workflow_run':
        return this.handleWorkflowRun(payload);
      case 'issues':
        return this.handleIssue(payload);
      case 'issue_comment':
        return this.handleIssueComment(payload);
      default:
        this.telemetry.log('router', 'event_ignored', { eventType, reason: 'No handler registered' });
        return { success: true, reason: `Event type '${eventType}' not handled` };
    }
  }

  private async handlePush(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { ref, repository, commits, pusher } = payload || {};
    const branch = typeof ref === 'string' ? ref.replace('refs/heads/', '') : '';

    if (branch !== 'main' && branch !== 'master') {
      return { success: true, reason: 'Non-main branch push ignored' };
    }

    const modifiedFiles = (commits || []).flatMap((c: Record<string, unknown>) => [
      ...((c?.added as string[]) || []),
      ...((c?.modified as string[]) || []),
      ...((c?.removed as string[]) || []),
    ]);

    const task = {
      type: 'code_push_analysis',
      priority: 'normal' as const,
      context: { repository: repository?.full_name, branch, commits: (commits || []).length, files: modifiedFiles, pusher: pusher?.name }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handlePullRequest(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { action, pull_request, repository } = payload || {};

    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
      return { success: true, reason: `PR action '${action}' not analyzed` };
    }

    const task = {
      type: 'pr_analysis',
      priority: 'high' as const,
      context: {
        repository: repository?.full_name,
        prNumber: pull_request?.number,
        title: pull_request?.title,
        author: pull_request?.user?.login,
        baseRef: pull_request?.base?.ref,
        headRef: pull_request?.head?.ref,
        changedFiles: pull_request?.changed_files,
        additions: pull_request?.additions,
        deletions: pull_request?.deletions
      }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handlePullRequestReview(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { action, review, pull_request, repository } = payload || {};
    if (action !== 'submitted' || (review?.state === 'approved' && !review?.body)) {
      return { success: true, reason: 'Review not analyzed' };
    }

    const task = {
      type: 'review_analysis',
      priority: 'normal' as const,
      context: { repository: repository?.full_name, prNumber: pull_request?.number, reviewer: review?.user?.login, state: review?.state, body: review?.body }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handleWorkflowRun(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { workflow_run, repository } = payload || {};
    if (workflow_run?.conclusion !== 'failure') {
      return { success: true, reason: 'Workflow did not fail' };
    }

    const task = {
      type: 'workflow_failure_analysis',
      priority: 'urgent' as const,
      context: { repository: repository?.full_name, workflowName: workflow_run?.name, runId: workflow_run?.id, headBranch: workflow_run?.head_branch, conclusion: workflow_run?.conclusion, url: workflow_run?.html_url }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handleIssue(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { action, issue, repository } = payload || {};
    if (action !== 'opened') return { success: true, reason: 'Issue not opened' };

    const labels = ((issue as Record<string, unknown>)?.labels as Array<Record<string, unknown> | string> || []).map((l: Record<string, unknown> | string) => (typeof l === 'string' ? l : (l as Record<string, unknown>)?.name as string));
    if (!labels.some((l: string) => ['bug', 'enhancement', 'feature'].includes((l || '').toLowerCase()))) {
      return { success: true, reason: 'Issue not labeled for analysis' };
    }

    const task = {
      type: 'issue_triage',
      priority: 'normal' as const,
      context: { repository: repository?.full_name, issueNumber: issue?.number, title: issue?.title, body: issue?.body, labels, author: issue?.user?.login }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handleIssueComment(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { action, comment, issue, repository } = payload || {};
    if (action !== 'created' || !comment?.body?.includes?.('@adgenai-bot')) {
      return { success: true, reason: 'Bot not mentioned' };
    }

    const task = {
      type: 'comment_response',
      priority: 'high' as const,
      context: { repository: repository?.full_name, issueNumber: issue?.number, commentId: comment?.id, body: comment?.body, author: comment?.user?.login }
    };

    return this.dispatcher.dispatch(task);
  }
}

