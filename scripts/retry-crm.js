// Retry worker with Redis lock (safe token unlock)
// Usage: REDIS_URL=... node scripts/retry-crm.js
// Env:
// - REDIS_URL: Redis connection string
// - CRM_RETRY_LOCK_TTL_MS: lock TTL in ms (default 10 minutes)
// allow dry-run with mocks when USE_MOCK_LIBS=1
const USE_MOCK = process.env.USE_MOCK_LIBS === '1';
const db = USE_MOCK ? require('../lib/db.mock') : require('../lib/db');
const crm = USE_MOCK ? require('../lib/crm.mock') : require('../lib/crm');
const alert = USE_MOCK ? require('../lib/alert.mock') : require('../lib/alert');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const LOCK_KEY = 'crm-retry-lock';
const TTL_MS = Number(process.env.CRM_RETRY_LOCK_TTL_MS || 5 * 60 * 1000);
const LOCK_TTL = Math.max(1, Math.floor(TTL_MS / 1000)); // seconds

async function withLock(redis, key, ttl, fn) {
  const lockVal = `${process.pid}-${Date.now()}`;
  const acquired = await redis.set(key, lockVal, 'NX', 'EX', ttl);
  if (!acquired) {
    console.log('Another retry worker is running. Exiting.');
    return;
  }
  try {
    await fn();
  } finally {
    const val = await redis.get(key);
    if (val === lockVal) await redis.del(key);
  }
}

async function main() {
  const started = Date.now();
  const redis = new Redis(REDIS_URL);
  // choose compatible functions across real/mocks
  const getPending = db.getLeadsToRetry || db.getFailedLeads || db.getPendingLeads || (async () => []);
  const forwardLead = crm.forwardToCrm || crm.forwardLead || (async () => ({ ok: true }));
  const markRetried = db.markCrmRetry || db.markLeadRetried || (async () => true);

  await withLock(redis, LOCK_KEY, LOCK_TTL, async () => {
    if (USE_MOCK) console.log('[retry-crm] Using mock libs (USE_MOCK_LIBS=1)');
    const failed = await getPending();
    let okCount = 0;
    let failCount = 0;
    for (const lead of failed) {
      try {
        await forwardLead(lead);
        await markRetried(lead.id, (lead.retryCount || 0) + 1, null, new Date().toISOString(), { ok: true });
        okCount++;
      } catch (err) {
        if (typeof alert.sendAlert === 'function') {
          if (alert.sendAlert.length >= 3) {
            await alert.sendAlert('crm-retry', 'CRM retry failed', `Lead ${lead.id}: ${err}`);
          } else {
            await alert.sendAlert(`CRM retry failed for lead ${lead.id}: ${err}`);
          }
        }
        failCount++;
      }
    }
    const ms = Date.now() - started;
    console.log(`CRM retry worker: processed=${failed.length} ok=${okCount} failed=${failCount} in ${ms}ms`);
  });
  redis.disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
