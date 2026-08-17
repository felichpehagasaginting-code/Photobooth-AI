# Daily Natural Commit Automation Script
# Run this script manually or via Task Scheduler for organic daily GitHub activity.
param(
    [int]$MinCommits = 25,
    [int]$MaxCommits = 45,
    [switch]$DryRun = $false
)

$commitMessages = @(
    "feat(photobooth): refine session photo capture sequence",
    "feat(ui): update download screen modal styling",
    "feat(filter): improve color balance adjustment preset",
    "fix(camera): resolve canvas stream lag on high load",
    "fix(firebase): handle connection dropout during batch sync",
    "fix(download): optimize image file name formatting",
    "perf(canvas): accelerate WebGL filter post-processing",
    "perf(ui): reduce layout re-renders on filter change",
    "refactor(components): extract reusable photo card container",
    "refactor(hooks): improve camera stream lifecycle handling",
    "style(theme): enhance dark mode subtle contrast borders",
    "style(button): fine-tune active press state animation",
    "docs(readme): update environment setup guidelines",
    "chore(deps): update minor library dependencies",
    "test(unit): add assertion checks for session duration"
)

$logFile = (Get-Item "docs/ACTIVITY_LOG.md").FullName
$today = Get-Date
$dateStr = $today.ToString("yyyy-MM-dd")
$dayOfWeek = $today.DayOfWeek
$random = New-Object Random

# Weekend adjustment
if ($dayOfWeek -eq [DayOfWeek]::Saturday -or $dayOfWeek -eq [DayOfWeek]::Sunday) {
    $targetCount = $random.Next(10, 22)
} else {
    $targetCount = $random.Next($MinCommits, $MaxCommits + 1)
}

Write-Host "Starting daily commit automation for $dateStr ($dayOfWeek)..." -ForegroundColor Cyan
Write-Host "Target Commits Today: $targetCount" -ForegroundColor Yellow

$currentHour = $today.Hour
$slot1 = [Math]::Max(1, [int]($targetCount * 0.35))
$slot2 = [Math]::Max(1, [int]($targetCount * 0.40))
$slot3 = $targetCount - $slot1 - $slot2

$times = @()
for ($i = 0; $i -lt $slot1; $i++) {
    $times += $today.Date.AddHours(9).AddMinutes($i * (200 / [Math]::Max(1, $slot1)) + $random.Next(-5, 5))
}
for ($i = 0; $i -lt $slot2; $i++) {
    $times += $today.Date.AddHours(13).AddMinutes(30).AddMinutes($i * (240 / [Math]::Max(1, $slot2)) + $random.Next(-5, 5))
}
for ($i = 0; $i -lt $slot3; $i++) {
    $times += $today.Date.AddHours(19).AddMinutes(30).AddMinutes($i * (180 / [Math]::Max(1, $slot3)) + $random.Next(-5, 5))
}

$times = $times | Sort-Object

$count = 0
foreach ($t in $times) {
    $count++
    $msg = $commitMessages[$random.Next(0, $commitMessages.Length)]
    $isoTimestamp = $t.ToString("yyyy-MM-ddTHH:mm:ss+07:00")

    if ($DryRun) {
        Write-Host "[DRY-RUN] Would commit ($isoTimestamp): $msg" -ForegroundColor Gray
    } else {
        $env:GIT_AUTHOR_DATE = $isoTimestamp
        $env:GIT_COMMITTER_DATE = $isoTimestamp

        $logLine = "- **$isoTimestamp** - [Daily Automation #$count] $msg`n"
        [System.IO.File]::AppendAllText($logFile, $logLine)

        git add docs/ACTIVITY_LOG.md
        git commit -m "$msg" --quiet
    }
}

Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host "Successfully generated $count daily commits for $dateStr!" -ForegroundColor Green
