cd "c:\Users\james\Documents\rathmullan-sailing-notes-main"
Write-Host "Current Directory: $(Get-Location)"
Write-Host "Checking git status..."
git status
Write-Host "`nAdding files..."
git add js/instructors.js instructors.html
Write-Host "`nGit diff cached:"
git diff --cached --name-only
Write-Host "`nCommitting changes..."
git commit -m "Add skills checklists with SBSS competencies and assessment tracking"
Write-Host "`nPushing to GitHub..."
git push origin main -v
Write-Host "`nPush complete!"
git log --oneline -1
