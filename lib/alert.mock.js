// lib/alert.mock.js -- simple alert logger for dry runs (CommonJS)
function sendAlert(channelOrMessage, title, text) {
  if (typeof title === 'undefined' && typeof text === 'undefined') {
    console.log('[alert.mock] sendAlert', { message: channelOrMessage });
  } else {
    console.log('[alert.mock] sendAlert', { channel: channelOrMessage, title, text });
  }
  return Promise.resolve(true);
}

module.exports = { sendAlert };

