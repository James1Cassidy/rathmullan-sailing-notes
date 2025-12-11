$content = Get-Content js/instructors.js -Raw
$opens = ([regex]::Matches($content, '\{') | Measure-Object).Count
$closes = ([regex]::Matches($content, '\}') | Measure-Object).Count
Write-Host "Open braces: $opens"
Write-Host "Close braces: $closes"
Write-Host "Difference: $($opens - $closes)"
