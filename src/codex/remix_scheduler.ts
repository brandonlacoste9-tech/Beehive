export type RemixScheduleReceipt = {
  jobId: string;
  status: 'queued' | 'running' | 'completed';
  etaSeconds: number;
};

export function scheduleRemix(): RemixScheduleReceipt {
  return {
    jobId: `remix-${Date.now()}`,
    status: 'queued',
    etaSeconds: 90,
  };
}
