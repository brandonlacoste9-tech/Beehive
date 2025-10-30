// lib/db.mock.js -- lightweight mocks for local/dry runs (CommonJS)
function saveLead({ externalId, name, email, company, message, source }) {
  console.log('[db.mock] saveLead', { externalId, name, email, company, message, source });
  return Promise.resolve({ id: 1, external_id: externalId || 'mock-id', status: 'received' });
}

function markCrmResult(externalId, success, response) {
  console.log('[db.mock] markCrmResult', { externalId, success, response });
  return Promise.resolve(true);
}

function getLeadsToRetry(limit = 20) {
  console.log('[db.mock] getLeadsToRetry', { limit });
  // Return empty array by default; tests can stub different behavior
  return Promise.resolve([]);
}

function markCrmRetry(externalId, retryCount, nextAttempt, lastAttempt, response) {
  console.log('[db.mock] markCrmRetry', { externalId, retryCount, nextAttempt, lastAttempt, response });
  return Promise.resolve(true);
}

module.exports = {
  saveLead,
  markCrmResult,
  getLeadsToRetry,
  markCrmRetry,
};

