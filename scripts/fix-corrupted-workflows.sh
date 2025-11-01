#!/bin/bash

# ================================================================
# Fix Corrupted GitHub Actions Workflow Files
# ================================================================
# This script detects and removes corrupted workflow directory
# structures that may have been created due to git/filesystem issues.
#
# Usage: ./scripts/fix-corrupted-workflows.sh
# ================================================================

set -e

WORKFLOWS_DIR=".github/workflows"
FIXED=0
ERRORS=0

echo "🔍 Scanning for corrupted workflow files in $WORKFLOWS_DIR..."
echo ""

# Check if workflows directory exists
if [ ! -d "$WORKFLOWS_DIR" ]; then
    echo "⚠️  Warning: $WORKFLOWS_DIR directory does not exist"
    exit 0
fi

# Find directories with invalid names (containing YAML syntax)
while IFS= read -r -d '' invalid_dir; do
    if [[ "$invalid_dir" =~ "uses:"  ||  "$invalid_dir" =~ "name:" || "$invalid_dir" =~ "actions/" ]]; then
        echo "❌ Found corrupted directory: $invalid_dir"

        # Ask for confirmation before removing
        read -p "Remove this directory? (y/N): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if rm -rf "$invalid_dir"; then
                echo "✅ Removed: $invalid_dir"
                ((FIXED++))
            else
                echo "❗ Failed to remove: $invalid_dir"
                ((ERRORS++))
            fi
        else
            echo "⏭️  Skipped: $invalid_dir"
        fi
        echo ""
    fi
done < <(find "$WORKFLOWS_DIR" -mindepth 1 -type d -print0)

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   Fixed: $FIXED"
echo "   Errors: $ERRORS"
echo ""

if [ $FIXED -gt 0 ]; then
    echo "✅ Workflow directory cleaned successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Review remaining files: ls -la $WORKFLOWS_DIR"
    echo "   2. Add proper workflow files if needed"
    echo "   3. Commit changes: git add . && git commit -m 'fix: Remove corrupted workflow files'"
elif [ $ERRORS -gt 0 ]; then
    echo "❌ Some errors occurred during cleanup"
    exit 1
else
    echo "✨ No corrupted workflows found - all clean!"
fi
