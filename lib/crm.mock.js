// lib/crm.mock.js -- fake CRM forwarder for dry runs (CommonJS)
function forwardToCrm(payload = {}) {
  console.log('[crm.mock] forwardToCrm', payload);
  // emulate success
  return Promise.resolve({ ok: true, status: 200, data: { mock: true, payload } });
}

module.exports = { forwardToCrm };

