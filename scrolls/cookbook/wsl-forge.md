# 📜 Scroll of the WSL Forge

## Invocation
> “Do not build upon the shifting sands of `/mnt/c/…`, for the I/O there is slow and tangled. Instead, keep your hive’s code within the Linux home, where the forge burns fastest.”

---

## I. The Ritual of Placement
- **Avoid:** `/mnt/c/...` (Windows-mounted paths) → slower I/O, symlink/permission quirks.
- **Prefer:** `~/code/my-app` (Linux home directory) → faster, cleaner, fewer issues.

---

## II. Steps of Inscription
```bash
# Create a code directory in your Linux home
mkdir -p ~/code && cd ~/code

# Clone your repository into the hive
git clone https://github.com/your/repo.git

# Enter the project
cd repo
```

---

## III. Windows Access Path
- If you need to open files from Windows Explorer:
  - Navigate to:
    ```
    \\wsl$\Ubuntu\home\<user>\code\repo
    ```
- This gives Windows visibility into your Linux-native repo without slowing down your dev loop.

---

## IV. Seal Metadata
```yaml
title: "scroll(wsl-forge): working with code inside WSL"
description: >
  Guidance for placing repos under Linux home (~) instead of /mnt/c
  for faster I/O and fewer symlink/permission issues.
author: "swarm/keeper-tristan"
status: "sealed"
tags: [wsl, codex, forge, linux, windows, repos]
```

---

✨ With this scroll, contributors know:
- **Where to place code** (Linux home, not `/mnt/c`)
- **How to clone and work** (mkdir → git clone → cd)
- **How to access from Windows** (`\\wsl$\Ubuntu\home\<user>`)
