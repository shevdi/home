// #region agent log
import fs from 'fs';
import { execSync, execFileSync } from 'child_process';

function append(row) {
  const payload = {
    sessionId: '87ff80',
    runId: process.env.GITHUB_RUN_ID || 'local',
    timestamp: Date.now(),
    ...row,
  };
  const line = JSON.stringify(payload);
  fs.appendFileSync('debug-87ff80.log', `${line}\n`);
  fetch('http://127.0.0.1:7915/ingest/9992f24d-00f6-41c9-bc27-a45102f4306c', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '87ff80' },
    body: line,
  }).catch(() => {});
}
// #endregion

const cmd = process.argv[2];

if (cmd === 'context') {
  // #region agent log
  append({
    hypothesisId: 'H4',
    location: 'scripts/agent-release-debug.mjs:context',
    message: 'workflow start context',
    data: {
      GITHUB_REF: process.env.GITHUB_REF,
      GITHUB_REF_NAME: process.env.GITHUB_REF_NAME,
      TAG: process.env.TAG,
    },
  });
  // #endregion
} else if (cmd === 'postdocs') {
  const tag = process.env.TAG || '';
  const p = `docs/releases/${tag}/release-notes.md`;
  const allure = `docs/releases/${tag}/allure-report/index.html`;
  // #region agent log
  append({
    hypothesisId: 'H4',
    location: 'scripts/agent-release-debug.mjs:postdocs',
    message: 'after generate release notes / allure',
    data: {
      tag,
      releaseNotesExists: fs.existsSync(p),
      allureIndexExists: fs.existsSync(allure),
    },
  });
  // #endregion
} else if (cmd === 'probe') {
  const tag = process.env.TAG || '';
  const rb = `release/${tag.replace(/^v/, '')}`;
  let out = '';
  try {
    out = execFileSync('git', ['ls-remote', '--heads', 'origin', rb], { encoding: 'utf8' });
  } catch (e) {
    out = `ERROR: ${e.stderr || e.message}`;
  }
  // #region agent log
  append({
    hypothesisId: 'H1',
    location: 'scripts/agent-release-debug.mjs:probe',
    message: 'merge uses tag SHA; optional release branch probe',
    data: {
      tag,
      tagSha: process.env.GITHUB_SHA,
      releaseBranch: rb,
      lsRemote: out.trim().slice(0, 2000),
    },
  });
  // #endregion
} else if (cmd === 'after-fetch') {
  let branch = '';
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    branch = String(e.message);
  }
  // #region agent log
  append({
    hypothesisId: 'H2',
    location: 'scripts/agent-release-debug.mjs:after-fetch',
    message: 'after git fetch (before merge)',
    data: { branch },
  });
  // #endregion
} else if (cmd === 'after-merge') {
  let log1 = '';
  try {
    log1 = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
  } catch (e) {
    log1 = String(e.message);
  }
  // #region agent log
  append({
    hypothesisId: 'H2',
    location: 'scripts/agent-release-debug.mjs:after-merge',
    message: 'after merge into main',
    data: { head: log1 },
  });
  // #endregion
} else if (cmd === 'after-push') {
  let log1 = '';
  try {
    log1 = execSync('git log -1 --oneline origin/main', { encoding: 'utf8' }).trim();
  } catch (e) {
    log1 = String(e.message);
  }
  // #region agent log
  append({
    hypothesisId: 'H3',
    location: 'scripts/agent-release-debug.mjs:after-push',
    message: 'after git push to main',
    data: { originMainHead: log1 },
  });
  // #endregion
} else {
  process.stderr.write(`usage: node scripts/agent-release-debug.mjs <context|postdocs|probe|after-fetch|after-merge|after-push>\n`);
  process.exit(1);
}
