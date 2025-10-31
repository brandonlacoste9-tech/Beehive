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

    const modifiedFiles = (commits as Record<string, unknown>[] || []).flatMap((c: Record<string, unknown>) => [
      ...((c?.added as string[]) || []),
      ...((c?.modified as string[]) || []),
      ...((c?.removed as string[]) || []),
    ]);

    const task = {
      type: 'code_push_analysis',
      priority: 'normal' as const,
      context: {
        repository: (repository as Record<string, unknown>)?.full_name,
        branch,
        commits: (commits as unknown[])?.length || 0,
        files: modifiedFiles,
        pusher: (pusher as Record<string, unknown>)?.name
      }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handlePullRequest(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { action, pull_request, repository } = payload || {};

    if (!['opened', 'synchronize', 'reopened'].includes(action as string)) {
      return { success: true, reason: `PR action '${action}' not analyzed` };
    }

    const pr = pull_request as Record<string, unknown> || {};
    const repo = repository as Record<string, unknown> || {};

    const task = {
      type: 'pr_analysis',
      priority: 'high' as const,
      context: {
        repository: (repo as Record<string, unknown>)?.full_name,
        prNumber: (pr as Record<string, unknown>)?.number,
        title: (pr as Record<string, unknown>)?.title,
        author: ((pr as Record<string, unknown>)?.user as Record<string, unknown>)?.login,
        baseRef: ((pr as Record<string, unknown>)?.base as Record<string, unknown>)?.ref,
        headRef: ((pr as Record<string, unknown>)?.head as Record<string, unknown>)?.ref,
        changedFiles: (pr as Record<string, unknown>)?.changed_files,
        additions: (pr as Record<string, unknown>)?.additions,
        deletions: (pr as Record<string, unknown>)?.deletions
      }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handlePullRequestReview(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { action, review, pull_request, repository } = payload || {};
    const rev = review as Record<string, unknown> || {};
    if (action !== 'submitted' || ((rev as Record<string, unknown>)?.state === 'approved' && !(rev as Record<string, unknown>)?.body)) {
      return { success: true, reason: 'Review not analyzed' };
    }

    const task = {
      type: 'review_analysis',
      priority: 'normal' as const,
      context: {
        repository: (repository as Record<string, unknown>)?.full_name,
        prNumber: (pull_request as Record<string, unknown>)?.number,
        reviewer: ((rev as Record<string, unknown>)?.user as Record<string, unknown>)?.login,
        state: (rev as Record<string, unknown>)?.state,
        body: (rev as Record<string, unknown>)?.body
      }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handleWorkflowRun(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { workflow_run, repository } = payload || {};
    const wr = workflow_run as Record<string, unknown> || {};
    if ((wr as Record<string, unknown>)?.conclusion !== 'failure') {
      return { success: true, reason: 'Workflow did not fail' };
    }

    const task = {
      type: 'workflow_failure_analysis',
      priority: 'urgent' as const,
      context: {
        repository: (repository as Record<string, unknown>)?.full_name,
        workflowName: (wr as Record<string, unknown>)?.name,
        runId: (wr as Record<string, unknown>)?.id,
        headBranch: (wr as Record<string, unknown>)?.head_branch,
        conclusion: (wr as Record<string, unknown>)?.conclusion,
        url: (wr as Record<string, unknown>)?.html_url
      }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handleIssue(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { action, issue, repository } = payload || {};
    if (action !== 'opened') return { success: true, reason: 'Issue not opened' };

    const iss = issue as Record<string, unknown> || {};
    const labels = ((iss as Record<string, unknown>)?.labels as Array<Record<string, unknown> | string> || []).map((l: Record<string, unknown> | string) => (typeof l === 'string' ? l : (l as Record<string, unknown>)?.name as string));
    if (!labels.some((l: string) => ['bug', 'enhancement', 'feature'].includes((l || '').toLowerCase()))) {
      return { success: true, reason: 'Issue not labeled for analysis' };
    }

    const task = {
      type: 'issue_triage',
      priority: 'normal' as const,
      context: {
        repository: (repository as Record<string, unknown>)?.full_name,
        issueNumber: (iss as Record<string, unknown>)?.number,
        title: (iss as Record<string, unknown>)?.title,
        body: (iss as Record<string, unknown>)?.body,
        labels,
        author: ((iss as Record<string, unknown>)?.user as Record<string, unknown>)?.login
      }
    };

    return this.dispatcher.dispatch(task);
  }

  private async handleIssueComment(payload: Record<string, unknown>): Promise<RoutingResult> {
    const { action, comment, issue, repository } = payload || {};
    const com = comment as Record<string, unknown> || {};
    const body = (com as Record<string, unknown>)?.body as string || '';
    if (action !== 'created' || !body.includes('@adgenai-bot')) {
      return { success: true, reason: 'Bot not mentioned' };
    }

    const task = {
      type: 'comment_response',
      priority: 'high' as const,
      context: {
        repository: (repository as Record<string, unknown>)?.full_name,
        issueNumber: (issue as Record<string, unknown>)?.number,
        commentId: (com as Record<string, unknown>)?.id,
        body,
        author: ((com as Record<string, unknown>)?.user as Record<string, unknown>)?.login
      }
    };

    return this.dispatcher.dispatch(task);
  }
}

