import { TelemetryLogger } from './telemetry';

export interface SwarmTask {
  type: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  context: Record<string, any>;
}

export interface DispatchResult {
  success: boolean;
  taskId?: string;
  reason?: string;
}

export class SwarmDispatcher {
  private telemetry: TelemetryLogger;
  private taskQueue: SwarmTask[] = [];

  constructor(telemetry: TelemetryLogger) {
    this.telemetry = telemetry;
  }

  async dispatch(task: SwarmTask): Promise<DispatchResult> {
    const taskId = this.generateTaskId();
    this.telemetry.log('dispatcher', 'task_created', { taskId, type: task.type, priority: task.priority, context: task.context });
    this.taskQueue.push(task);
    this.telemetry.log('dispatcher', 'task_queued', { taskId, queueLength: this.taskQueue.length });
    return { success: true, taskId };
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getQueueStatus() {
    return { length: this.taskQueue.length, tasks: this.taskQueue.map(t => ({ type: t.type, priority: t.priority })) };
  }
}

