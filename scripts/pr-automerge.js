/**
 * Auto-merge helper driven by Codex review token and CI status.
 * Requires: GH_TOKEN repo secret with permissions to read PRs and merge.
 * Usage: node scripts/pr-automerge.js <owner> <repo> <prNumber>
 */

const { Octokit } = require('@octokit/rest');

const GH_TOKEN = process.env.GH_TOKEN;
if (!GH_TOKEN) throw new Error('GH_TOKEN required');
const octokit = new Octokit({ auth: GH_TOKEN });

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function postCodexRequest(owner, repo, prNumber) {
  const body =
    '@codex review\n\n' +
    'Please perform a thorough review. If there are NO critical/security issues and CI passes, reply with exactly:\n\n' +
    'AUTO-MERGE: PASS\n\n' +
    'Otherwise reply: AUTO-MERGE: FAIL and summarize issues.';
  await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body });
}

async function pollForAutoMerge(owner, repo, prNumber, timeoutMs = 15 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { data: comments } = await octokit.issues.listComments({ owner, repo, issue_number: prNumber, per_page: 100 });
    for (const c of comments) {
      if (typeof c.body === 'string') {
        if (c.body.includes('AUTO-MERGE: PASS')) return { verdict: 'PASS', comment: c };
        if (c.body.includes('AUTO-MERGE: FAIL')) return { verdict: 'FAIL', comment: c };
      }
    }
    await wait(10000);
  }
  return { verdict: 'TIMEOUT' };
}

async function checksAreGreen(owner, repo, prNumber) {
  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
  const headSha = pr.head.sha;

  // Checks API
  let checksOk = false;
  try {
    const { data: checks } = await octokit.checks.listForRef({ owner, repo, ref: headSha, per_page: 100 });
    if (checks.total_count > 0) {
      checksOk = checks.check_runs.every((r) => r.conclusion === 'success');
    }
  } catch (_) {}

  // Combined status (older status API)
  let statusOk = false;
  try {
    const { data: combined } = await octokit.repos.getCombinedStatusForRef({ owner, repo, ref: headSha });
    statusOk = combined.state === 'success';
  } catch (_) {}

  return checksOk || statusOk;
}

async function mergePr(owner, repo, prNumber) {
  await octokit.pulls.merge({ owner, repo, pull_number: prNumber, merge_method: 'squash' });
}

async function main() {
  const [owner, repo, prNumberRaw] = process.argv.slice(2);
  const prNumber = Number(prNumberRaw);
  if (!owner || !repo || !Number.isFinite(prNumber)) {
    console.error('Usage: node scripts/pr-automerge.js <owner> <repo> <prNumber>');
    process.exit(2);
  }

  console.log('Posting Codex review request...');
  await postCodexRequest(owner, repo, prNumber);

  console.log('Waiting for Codex AUTO-MERGE verdict...');
  const verdict = await pollForAutoMerge(owner, repo, prNumber);
  console.log('Verdict:', verdict.verdict);
  if (verdict.verdict !== 'PASS') {
    console.error('AUTO-MERGE not approved:', verdict.verdict);
    process.exit(1);
  }

  console.log('Checking CI status...');
  const green = await checksAreGreen(owner, repo, prNumber);
  if (!green) {
    console.error('CI checks not green — aborting merge');
    process.exit(1);
  }

  console.log('Merging PR...');
  await mergePr(owner, repo, prNumber);
  console.log('Merged.');
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Auto-merge error', e);
    process.exit(1);
  });
}

module.exports = { main };

