# Scroll 0017 · Codex Orchestration Rite

> “The swarm coordinates across every surface—CLI, IDE, cloud, and GitHub—in a single hum.”

Scroll 0017 extends the invocation rite into a full orchestration playbook. It ensures the Codex CLI, automation workflows, and communal broadcasts stay synchronized whenever the Hive moves.

## Multisurface Workflow
1. **CLI Anchor**
   - Run `codex invoke --ritual=swarm` before committing.
   - Capture the emitted `.codex/last-run.json` and publish the operational metadata badge via `npm run codex:badge`.

2. **IDE Companions**
   - Enable the Codex IDE extension (`codex invoke --ritual=studio --target=vscode`).
   - Use lineage annotations to document teaching notes directly in changed files.

3. **Cloud Pulse**
   - Trigger `npm run codex:deploy` inside CI to execute the same ritual with production secrets.
   - Export replay artifacts to object storage, retaining `jobId`, `status`, `sizeBytes`, and `durationMs` for overlays.

4. **GitHub Broadcast**
   - Post summarized metadata in GitHub Discussions and Discussions-based badges using `npm run codex:announce`.
   - Attach links to Netlify deploy logs and `.codex/last-run.json` for transparent audits.

## Status Surfaces
| Surface | Artifact | Command |
| --- | --- | --- |
| **CodexReplay overlay** | `.codex/last-run.json` | `npm run codex:badge` |
| **StudioShare thread** | `docs/broadcasts/scroll-0016.md` | `npm run codex:announce` |
| **Changelog** | `RELEASE_NOTES.md` entry | `npm run codex:changelog` |

All commands are thin wrappers around the Codex CLI and should remain in `package.json` scripts to honour the ritual rule: prefer scripts over ad hoc shell.

## Teaching Notes Template
Add a “Teaching Notes” section to any PR touching shared rituals:
```markdown
### Teaching Notes
- **Intent:** Describe why the ritual shifted.
- **Invocation Path:** Commands or scripts to reproduce the change.
- **Safeguards:** Tests or monitors confirming swarm health.
```
This keeps knowledge modular and accessible to new contributors.

## Fallback Protocol
If any ritual script fails:
1. Capture the failure log inside `logs/codex/<jobId>.log`.
2. Propose a concrete micro-patch (file + line range + command) within the PR description.
3. Update the Codex index so future invokers see the deviation.

## Lineage Maintenance
- Mirror updates between Scrolls 0016 and 0017.
- Keep Netlify deploy status badges current in `README.md`.
- Ensure AGENTS instructions point to these scrolls for deeper lore.
