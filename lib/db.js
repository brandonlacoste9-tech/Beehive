// lib/db.js
// Add markCrmRetry for retry tracking
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

export async function markCrmRetry(externalId, retryCount, nextAttempt, lastAttempt, response) {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE leads SET crm_retry_count = $1, next_crm_attempt_at = $2, last_crm_attempt_at = $3, crm_response = $4, updated_at = NOW() WHERE external_id = $5`,
      [retryCount, nextAttempt, lastAttempt, response ? JSON.stringify(response) : null, externalId]
    );
  } finally {
    client.release();
  }
}

// ...existing db helpers (saveLead, markCrmResult, etc.)
