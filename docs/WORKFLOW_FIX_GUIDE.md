# GitHub Actions Workflow Fix Guide

## Issue Description

A corrupted directory structure was found in `.github/workflows/` with an invalid name:
```
.github/workflows/- name: Cache   uses: actions/
```

This appears to be caused by YAML workflow content being used as directory names, creating nested corrupted structures.

## Root Cause

This corruption typically occurs when:
- Git operations are interrupted during workflow file operations
- Filesystem errors during checkout/merge operations
- Automated tools creating invalid directory structures
- Conflicts during merge operations with workflow files

## Solution Applied

### 1. Removed Corrupted Structure

The corrupted directory and all nested subdirectories were removed:
```bash
rm -rf ".github/workflows/- name: Cache   uses: actions"
```

### 2. Added Clean CI Workflow

A new, clean CI workflow was created at `.github/workflows/ci.yml` that:
- Runs on push to `main` and all pull requests
- Executes linting, type checking, and tests
- Builds the application to verify no build errors
- Uses modern GitHub Actions with proper caching

### 3. Created Fix Script

A reusable bash script was added at `scripts/fix-corrupted-workflows.sh` to:
- Automatically detect corrupted workflow directories
- Safely remove them with user confirmation
- Provide clear feedback and next steps

## Prevention

To prevent this issue in the future:

1. **Use atomic git operations**: Complete pulls/merges before interrupting
2. **Regular validation**: Periodically check workflow directory structure:
   ```bash
   ls -la .github/workflows/
   ```
3. **Use the fix script**: Run `scripts/fix-corrupted-workflows.sh` if issues occur
4. **Proper workflow naming**: Always use `.yml` or `.yaml` extensions
5. **Review PRs carefully**: Check workflow file changes in pull requests

## Workflow Structure

The correct structure should be:
```
.github/
└── workflows/
    ├── ci.yml                 # Continuous Integration
    ├── deploy.yml            # Deployment (if needed)
    └── code-quality.yml      # Code quality checks (optional)
```

## Using the Fix Script

If you encounter corrupted workflows in the future:

```bash
# Make the script executable (first time only)
chmod +x scripts/fix-corrupted-workflows.sh

# Run the fix script
./scripts/fix-corrupted-workflows.sh

# Follow the prompts to remove corrupted directories
```

## Verification

After the fix, verify everything is working:

1. Check workflow directory structure:
   ```bash
   ls -la .github/workflows/
   ```

2. Validate YAML syntax:
   ```bash
   yamllint .github/workflows/*.yml
   ```

3. Test locally with act (if available):
   ```bash
   act -l  # List available workflows
   ```

4. Push to GitHub and check the Actions tab for proper execution

## Related Files

- `.github/workflows/ci.yml` - New CI workflow
- `scripts/fix-corrupted-workflows.sh` - Automated fix script
- This document - Fix guide and prevention tips

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions)
