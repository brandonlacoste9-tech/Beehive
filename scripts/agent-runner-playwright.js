#!/usr/bin/env node
/**
 * Playwright + LLM prototype agent-runner
 * - captures a screenshot
 * - runs Tesseract OCR (unless USE_MOCK_LIBS=1)
 * - builds a short prompt for an LLM
 * - returns a SAFE action suggestion (mock or real)
 *
 * Safety:
 * - requires AUTO_CONFIRM=1 to actually execute any DOM clicks/types
 * - supports USE_MOCK_LIBS=1 to avoid network/side effects
 */
const fs = require("fs");
const path = require("path");

const { chromium } = require("playwright");
const fetch = require("node-fetch");
const { execSync, execFileSync } = require("child_process");
const { validateAgentAction } = require("../lib/agent-schema");

const USE_MOCK = process.env.USE_MOCK_LIBS === "1";
const AUTO_CONFIRM = process.env.AUTO_CONFIRM === "1";
const ALLOWLIST = (process.env.AGENT_ALLOWLIST || "localhost,127.0.0.1").split(",");

async function ocrImage(buffer) {
  if (USE_MOCK) return { text: "mocked OCR text", boxes: [] };
  // Write buffer to file
  const tmpPath = path.join(__dirname, "ocr-tmp.png");
  fs.writeFileSync(tmpPath, buffer);
  try {
    // Use scripts/ocr.js for OCR and boxes
    const out = execFileSync("node", [path.join(__dirname, "ocr.js"), tmpPath], { encoding: "utf8" });
    return JSON.parse(out);
  } catch (err) {
    console.warn("[agent-playwright] OCR failed", err.message);
    return { text: "[OCR error]", boxes: [] };
  } finally {
    fs.unlinkSync(tmpPath);
  }
}

async function callLlm(prompt) {
  if (USE_MOCK) return {
    action: "click",
    selector: "button.mock",
    value: undefined,
    confidence: 1,
    explain: "mock response"
  };
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing for LLM call");
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    }),
  });
  const j = await resp.json();
  const text = j?.choices?.[0]?.message?.content || "";
  // Try to parse JSON
  try {
    const obj = JSON.parse(text);
    return obj;
  } catch {
    // fallback: try to extract JSON from text
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch {}
    }
    return { action: "noop", selector: "", value: undefined, confidence: 0, explain: "parse error" };
  }
}

function safeToAct(url) {
  try {
    const host = new URL(url).hostname;
    return ALLOWLIST.includes(host) || ALLOWLIST.includes("localhost") && (host === "localhost" || host === "127.0.0.1");
  } catch {
    return false;
  }
}

function isPromptInjection(obj) {
  // Simple check for suspicious keys or values
  const s = JSON.stringify(obj).toLowerCase();
  return s.includes("function") || s.includes("require(") || s.includes("process.env") || s.includes("<script") || s.includes("\u003cscript");
}

function logAudit(entry) {
  const logPath = path.join(__dirname, "../logs/agent-audit.log");
  const line = JSON.stringify({ ...entry, ts: new Date().toISOString() }) + "\n";
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, line);
}

async function run() {
  console.log("[agent-playwright] starting (mock=", USE_MOCK, "auto_confirm=", AUTO_CONFIRM, ")");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  // navigate to a test page (configurable)
  const startUrl = process.env.AGENT_START_URL || "http://localhost:3000";
  console.log("[agent-playwright] goto", startUrl);
  await page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(e=>{console.warn("goto failed",e)});
  const screenshotBuffer = await page.screenshot({ fullPage: true });
  fs.writeFileSync("last-screenshot.png", screenshotBuffer);
  const ocrResult = await ocrImage(screenshotBuffer);
  const prompt = `Given the following OCR result, output a single JSON object matching this schema: { action: \"click\"|\"type\"|\"select\"|\"noop\", selector: string, value?: string, confidence: number (0-1), explain: string } Only output valid JSON. Do not include explanations or markdown.\nOCR: ${ocrResult.text}`;
  const suggestion = await callLlm(prompt);
  let valid = false, error = null;
  try {
    validateAgentAction(suggestion);
    valid = true;
  } catch (e) {
    error = e;
  }
  const auditEntry = {
    url: page.url(),
    ocr: ocrResult,
    prompt,
    suggestion,
    valid,
    error: error ? String(error) : undefined,
    allowlisted: safeToAct(page.url()),
    autoConfirm: AUTO_CONFIRM,
    acted: false
  };
  if (!valid) {
    console.log("[agent-playwright] invalid suggestion", suggestion, error);
    logAudit({ ...auditEntry, acted: false });
    await browser.close();
    return;
  }
  if (isPromptInjection(suggestion)) {
    console.log("[agent-playwright] prompt injection detected, aborting");
    logAudit({ ...auditEntry, acted: false, error: "prompt-injection" });
    await browser.close();
    return;
  }
  if (!safeToAct(page.url())) {
    console.log("[agent-playwright] action blocked by allowlist:", page.url());
    logAudit({ ...auditEntry, acted: false });
    await browser.close();
    return;
  }
  if (!AUTO_CONFIRM) {
    console.log("[agent-playwright] AUTO_CONFIRM not set; would perform:", suggestion);
    logAudit({ ...auditEntry, acted: false });
    await browser.close();
    return;
  }
  // Actually perform the action
  let acted = false;
  try {
    if (suggestion.action === "click" && suggestion.selector) {
      await page.click(suggestion.selector, { timeout: 5000 });
      acted = true;
      console.log("[agent-playwright] clicked", suggestion.selector);
    } else if (suggestion.action === "type" && suggestion.selector && suggestion.value) {
      await page.type(suggestion.selector, suggestion.value, { timeout: 5000 });
      acted = true;
      console.log("[agent-playwright] typed", suggestion.value, "into", suggestion.selector);
    } else if (suggestion.action === "select" && suggestion.selector && suggestion.value) {
      await page.selectOption(suggestion.selector, suggestion.value);
      acted = true;
      console.log("[agent-playwright] selected", suggestion.value, "in", suggestion.selector);
    } else {
      console.log("[agent-playwright] no actionable suggestion or noop");
    }
  } catch (err) {
    console.warn("[agent-playwright] action failed", err.message);
  }
  logAudit({ ...auditEntry, acted });
  await browser.close();
}

(async ()=> {
  try {
    await run();
    console.log("[agent-playwright] done");
    process.exit(0);
  } catch (err) {
    console.error("[agent-playwright] error", err);
    process.exit(2);
  }
})();
