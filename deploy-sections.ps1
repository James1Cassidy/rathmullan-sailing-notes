# Deploy collapsible sections changes to GitHub/Cloudflare
# This script commits and pushes the sailing skills section reorganization

Set-Location "c:\Users\james\Documents\rathmullan-sailing-notes-main"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Deploying Collapsible Skills Sections" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

# Check current status
Write-Host "`n[1/4] Checking git status..." -ForegroundColor Yellow
git status

# Stage all changes
Write-Host "`n[2/4] Staging changes..." -ForegroundColor Yellow
git add -A
git diff --cached --stat

# Commit with descriptive message
Write-Host "`n[3/4] Creating commit..." -ForegroundColor Yellow
$commitMessage = "feat: Add collapsible section headers to skills checklist

- Reorganize all 5 sailing levels (Taste, Start Sailing, Basic Skills, Improving Skills, Advanced) into section-based structure
- Add collapsible/expandable sections with ▼/▶ toggle arrows
- Implement localStorage persistence for section states
- Update loadStudentSkillsChecklist() to render section hierarchy
- Add toggleSection() function for collapse/expand functionality
- Update printStudentSkills() to include section headers in output
- Maintain backward compatibility with legacy flat competencies
- All 210+ sailing skills organized under appropriate section headers"

git commit -m "$commitMessage"

# Push to GitHub (triggers Cloudflare auto-deploy)
Write-Host "`n[4/4] Pushing to GitHub (this triggers Cloudflare deployment)..." -ForegroundColor Yellow
Write-Host "This may take 10-30 seconds..." -ForegroundColor Gray

git push origin main -v

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`nChanges will be live on Cloudflare shortly (2-5 minutes)." -ForegroundColor Yellow
Write-Host "Check your site at: https://rathmullan-sailing-notes.netlify.app" -ForegroundColor Cyan

Write-Host "`nRecent commits:" -ForegroundColor Green
git log --oneline -3
