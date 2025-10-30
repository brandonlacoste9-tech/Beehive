// lib/alert.js
// Simple Slack webhook alert utility for operational notifications
import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export async function sendAlert(message, extra = {}) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not set, alert not sent:", message);
    return;
  }
  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: message,
      ...extra,
    });
  } catch (err) {
    console.error("Failed to send Slack alert", err);
  }
}
