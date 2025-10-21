# Scroll of Discovery — Finding Codex in WSL

> “When the IDE calls for Codex and silence answers, seek the binary in the forge. If it is not found, re‑inscribe it upon the path.”

---

## I. Verify the Binary
Invoke the ritual to confirm whether the Codex binary is known to the shell.

```bash
which codex || echo "codex not found"
```

- Path returned (for example, `/home/<user>/.nvm/versions/node/v22.x.x/bin/codex`) → Codex is installed and exported.
- `codex not found` → reinstall or export the binary.

---

## II. Re-inscribe Codex
If Codex is missing, reinstall globally inside the WSL environment and confirm the inscription.

```bash
npm i -g @openai/codex
which codex
```

---

## III. Ensure PATH is Exported
If VS Code still cannot summon Codex:

1. Ensure shell startup files (such as `~/.bashrc` or `~/.zshrc`) export the NVM bin path.
   ```bash
   export PATH="$HOME/.nvm/versions/node/$(nvm version)/bin:$PATH"
   ```
2. Reload the shell or restart WSL.
   ```bash
   exec $SHELL
   ```

---

## IV. Seal Metadata
```yaml
title: "scroll(wsl-codex-troubleshoot): locating codex binary"
description: >
  Ritual for verifying Codex binary in WSL, reinstalling if missing,
  and ensuring PATH is correctly exported for VS Code integration.
author: "swarm/keeper-tristan"
status: "sealed"
tags: [wsl, codex, vscode, path, troubleshoot]
```

---

✨ With this scroll, contributors can verify, reinstall, and expose Codex so VS Code inside WSL can summon it properly.
