@echo off
REM Phase-2 Orchestrator Setup Script (Windows)
REM Creates GitHub labels and initializes automated PR workflow
REM Usage: PHASE2_SETUP.bat

echo.
echo 🚀 Phase-2 Orchestrator Setup
echo ================================
echo.

REM Get repo name via gh CLI
for /f "tokens=*" %%i in ('gh repo view --json nameWithOwner -q .nameWithOwner') do set REPO=%%i
echo Repository: %REPO%
echo.

REM Create labels
echo 📌 Creating GitHub labels...

gh label create "PR-3: Providers" ^
  --description "Provider integration tasks" ^
  --color "ff5733" 2>nul || echo Label 'PR-3: Providers' already exists

gh label create "PR-1: Supabase" ^
  --description "Supabase data access + RLS" ^
  --color "33ff57" 2>nul || echo Label 'PR-1: Supabase' already exists

gh label create "PR-5: Auth" ^
  --description "Supabase Auth + user ownership" ^
  --color "5743ff" 2>nul || echo Label 'PR-5: Auth' already exists

gh label create "area: ci-cd" ^
  --description "GitHub Actions, deployment" ^
  --color "0366d6" 2>nul || echo Label 'area: ci-cd' already exists

gh label create "type: docs" ^
  --description "Documentation updates" ^
  --color "d4c5f9" 2>nul || echo Label 'type: docs' already exists

gh label create "type: test" ^
  --description "Test updates" ^
  --color "a2eeef" 2>nul || echo Label 'type: test' already exists

echo ✅ Labels created
echo.

REM Create GitHub project
echo 📊 Creating Phase-2 GitHub Project...
echo (Note: gh project create may require manual setup on Windows)
echo Visit: https://github.com/%REPO%/projects/new
echo Title: Phase-2: Providers, Supabase, Auth
echo.

echo ================================
echo ✅ Phase-2 Setup Complete!
echo.
echo Next steps:
echo 1. Create a test branch: git checkout -b feat/phase2-kickoff
echo 2. Touch a file to trigger: mkdir lib\providers
echo 3. Commit and push: git push -u origin feat/phase2-kickoff
echo 4. Open PR and watch the orchestrator run!
echo.
echo 📚 Read more:
echo    - copilot-instructions.md (CCR priorities)
echo    - COPILOT_GUARDRAILS.md (hard constraints)
echo    - INFRASTRUCTURE_COMPLETE.md (full setup)
echo.
pause
