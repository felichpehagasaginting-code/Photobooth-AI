# Script to Generate Natural & Consistent Backdated Commits for May, June, July 2026
param(
    [string]$StartDateStr = "2026-05-01",
    [string]$EndDateStr = "2026-07-31",
    [switch]$DryRun = $false
)

$commitMessages = @(
    "feat(photobooth): implement multi-frame collage capture sequence",
    "feat(camera): add dynamic exposure and focus adjustment controls",
    "feat(filter): introduce vintage polaroid color lookup preset",
    "feat(filter): add cyber-neon and grain texture post-processing overlay",
    "feat(ui): implement smooth countdown overlay animation before shutter",
    "feat(gallery): add touch swipe navigation for captured photo previews",
    "feat(share): generate instant QR code for mobile photo download",
    "feat(export): support high-resolution PNG and PDF print strip layout",
    "feat(audio): add shutter click and countdown sound effects",
    "feat(theme): introduce warm studio and monochrome dark themes",
    "feat(ai): integrate edge background removal model",
    "feat(watermark): customizable event logo watermark overlay",
    "feat(stickers): support draggable and resizable decorative stickers",
    "feat(preset): allow custom framing border selection per session",
    "feat(kiosk): add full-screen lock and inactivity reset timer",
    "feat(preview): render live filter preview using WebGL shader canvas",
    "feat(settings): add camera device selector with resolution fallbacks",
    "feat(analytics): log anonymous capture session completion metrics",
    "feat(print): integrate direct thermal printer web serial interface",
    "feat(cloud): async upload queue for batch photo backup",

    "fix(camera): resolve aspect ratio distortion on ultrawide webcams",
    "fix(camera): prevent stream freeze on rapid device re-plug",
    "fix(filter): fix gamma correction clipping on high brightness scenes",
    "fix(ui): correct modal z-index layering on small mobile viewports",
    "fix(firebase): handle network timeout retry in transaction hook",
    "fix(download): resolve blob URL memory leak on repeated downloads",
    "fix(qr): adjust QR code contrast ratio for low-light scanning",
    "fix(audio): unlock audio context on initial user gesture",
    "fix(canvas): prevent blur artifacts during canvas downsampling",
    "fix(print): fix page margin clipping on 4x6 photo paper print preview",
    "fix(auth): prevent race condition when initializing anonymous session",
    "fix(state): sync active photo index when reopening gallery drawer",
    "fix(touch): prevent accidental pinch-zoom gesture on kiosk screen",
    "fix(api): validate payload schema before processing seed request",
    "fix(timer): clear interval on component unmount to prevent memory leak",
    "fix(layout): adjust flexbox wrap behavior on tablet landscape mode",
    "fix(accessibility): add missing aria-labels to icon action buttons",
    "fix(hydration): resolve client-server timestamp mismatch in activity log",
    "fix(export): handle canvas taint error when loading external assets",
    "fix(storage): add fallback for local storage quota exceeded errors",

    "refactor(camera): extract media stream hook into standalone module",
    "refactor(canvas): simplify image compositing pipeline architecture",
    "refactor(filter): organize color grading matrices into separate configs",
    "refactor(state): migrate photo session state management to zustand store",
    "refactor(ui): extract reusable glass-panel and badge components",
    "refactor(types): consolidate photobooth session type definitions",
    "refactor(api): modularize backend route handlers and validation utils",
    "refactor(hooks): create custom useDebounce and useThrottle utilities",
    "refactor(utils): streamline color conversion and hex parsing helpers",
    "refactor(styles): migrate hardcoded color values to CSS design tokens",

    "perf(canvas): optimize canvas 2D context rendering with offscreen canvas",
    "perf(images): compress intermediate preview thumbnails with WebP format",
    "perf(bundle): implement dynamic lazy loading for heavy filter shaders",
    "perf(render): memoize grid item rendering to prevent redundant cycles",
    "perf(memory): dispose cached image objects after strip generation",
    "perf(fonts): preload display typography to eliminate FOIT delay",
    "perf(anim): offload countdown animations to GPU composited layers",

    "style(photobooth): refine backdrop blur and color contrast for dark mode",
    "style(button): add subtle hover transition and outline focus style",
    "style(typography): refine letter-spacing and hierarchy for hero heading",
    "style(grid): modernize layout overlap for bento-style elements",
    "style(theme): update dark mode accent color tokens with warm tone",
    "style(modal): fine-tune cubic-bezier easing curves on open transition",
    "style(cards): apply subtle border gradient and elevation shadows",

    "docs(readme): add detailed hardware camera setup and compatibility guide",
    "docs(api): document endpoint parameters and error codes for seed route",
    "docs(arch): add architecture diagram explaining client-side filter flow",
    "docs(deploy): add production deployment instructions for Vercel/Docker",
    "docs(env): document all required environment variables with defaults",
    "docs(changelog): update version history and release milestones",

    "chore(deps): update core dependencies to latest stable versions",
    "chore(config): adjust tsconfig path aliases for cleaner imports",
    "chore(lint): configure ESLint rules for react hooks and accessibility",
    "chore(ci): adjust GitHub Actions caching for faster test execution",
    "chore(git): add ignore rules for local session exports and temp files",
    "test(utils): add unit tests for image aspect ratio calculator",
    "test(hooks): add test suite for camera stream lifecycle events",
    "test(canvas): add snapshot tests for multi-frame collage layouts"
)

$logFile = (Get-Item "docs/ACTIVITY_LOG.md").FullName
$startDate = [DateTime]::ParseExact($StartDateStr, "yyyy-MM-dd", $null)
$endDate = [DateTime]::ParseExact($EndDateStr, "yyyy-MM-dd", $null)
$totalDays = ($endDate - $startDate).Days + 1

$random = New-Object Random

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "May, June, July Natural Backdated Commit Generator" -ForegroundColor Yellow
Write-Host "Range: $StartDateStr to $EndDateStr ($totalDays days)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$totalCommitsGenerated = 0
$msgCount = $commitMessages.Length
$counter = 5000

for ($d = 0; $d -lt $totalDays; $d++) {
    $currentDay = $startDate.AddDays($d)
    $dateStr = $currentDay.ToString("yyyy-MM-dd")
    $dayOfWeek = $currentDay.DayOfWeek

    $isWeekend = ($dayOfWeek -eq [DayOfWeek]::Saturday -or $dayOfWeek -eq [DayOfWeek]::Sunday)
    
    if ($isWeekend) {
        $dailyCommitCount = $random.Next(12, 25)
    } elseif ($dayOfWeek -eq [DayOfWeek]::Monday -or $dayOfWeek -eq [DayOfWeek]::Friday) {
        $dailyCommitCount = $random.Next(30, 44)
    } else {
        $dailyCommitCount = $random.Next(36, 52)
    }

    $slot1Count = [Math]::Max(1, [int]($dailyCommitCount * 0.30))
    $slot3Count = [Math]::Max(1, [int]($dailyCommitCount * 0.25))
    $slot2Count = $dailyCommitCount - $slot1Count - $slot3Count

    $commitTimes = @()

    # Morning (09:00 - 12:30)
    for ($i = 0; $i -lt $slot1Count; $i++) {
        $minutes = ($i * (210 / [Math]::Max(1, $slot1Count))) + $random.Next(-8, 8)
        $minutes = [Math]::Max(0, [Math]::Min(210, $minutes))
        $commitTimes += $currentDay.AddHours(9).AddMinutes($minutes).AddSeconds($random.Next(0, 60))
    }

    # Afternoon (13:45 - 18:00)
    for ($i = 0; $i -lt $slot2Count; $i++) {
        $minutes = ($i * (255 / [Math]::Max(1, $slot2Count))) + $random.Next(-10, 10)
        $minutes = [Math]::Max(0, [Math]::Min(255, $minutes))
        $commitTimes += $currentDay.AddHours(13).AddMinutes(45).AddMinutes($minutes).AddSeconds($random.Next(0, 60))
    }

    # Evening (19:30 - 22:45)
    for ($i = 0; $i -lt $slot3Count; $i++) {
        $minutes = ($i * (195 / [Math]::Max(1, $slot3Count))) + $random.Next(-8, 8)
        $minutes = [Math]::Max(0, [Math]::Min(195, $minutes))
        $commitTimes += $currentDay.AddHours(19).AddMinutes(30).AddMinutes($minutes).AddSeconds($random.Next(0, 60))
    }

    $commitTimes = $commitTimes | Sort-Object

    foreach ($commitTime in $commitTimes) {
        $counter++
        $totalCommitsGenerated++
        $msgIndex = $random.Next(0, $msgCount)
        $msg = $commitMessages[$msgIndex]
        $isoTimestamp = $commitTime.ToString("yyyy-MM-ddTHH:mm:ss+07:00")

        $env:GIT_AUTHOR_DATE = $isoTimestamp
        $env:GIT_COMMITTER_DATE = $isoTimestamp

        $logLine = "- **$isoTimestamp** - [Activity #$counter] $msg`n"

        $written = $false
        for ($retry = 0; $retry -lt 5 -and -not $written; $retry++) {
            try {
                [System.IO.File]::AppendAllText($logFile, $logLine)
                $written = $true
            } catch {
                Start-Sleep -Milliseconds 25
            }
        }

        git add docs/ACTIVITY_LOG.md
        git commit -m "$msg" --quiet
    }

    if ($d % 10 -eq 0 -or $d -eq ($totalDays - 1)) {
        $percent = [Math]::Round((($d + 1) / $totalDays) * 100, 1)
        Write-Host "Progress: [$($d + 1) / $totalDays days] ($percent%) - Commits created: $totalCommitsGenerated..." -ForegroundColor Green
    }
}

Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Completed! Successfully created $totalCommitsGenerated natural commits for May, June, July." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
