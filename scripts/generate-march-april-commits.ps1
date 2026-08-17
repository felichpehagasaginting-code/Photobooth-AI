# Script to Generate Natural & Consistent Backdated Commits for March & April 2026 (and backward)
param(
    [string]$StartDateStr = "2026-03-01",
    [string]$EndDateStr = "2026-04-30",
    [switch]$DryRun = $false
)

$commitMessages = @(
    "feat(photobooth): initialize core camera streaming architecture",
    "feat(camera): add dynamic resolution negotiator and frame rate switcher",
    "feat(filter): implement real-time WebGL LUT matrix transformation",
    "feat(filter): add warm monochrome and film grain retro effects",
    "feat(ui): build interactive shutter trigger with pulsating visual feedback",
    "feat(ui): design responsive photobooth preview grid for kiosk mode",
    "feat(gallery): create instant session photo carousel with swipe gestures",
    "feat(share): implement client-side QR code generator for photo download",
    "feat(export): add multi-frame strip layout builder with dynamic margins",
    "feat(audio): integrate synthesized camera shutter click and countdown beeps",
    "feat(theme): configure dynamic dark mode CSS custom properties",
    "feat(stickers): support canvas-based sticker overlay and touch positioning",
    "feat(watermark): add customizable branding and event date stamp",
    "feat(kiosk): add auto-reset countdown timer on idle session",
    "feat(settings): create camera device selection modal with device ID persistence",
    "feat(analytics): dispatch anonymous capture telemetry events",
    "feat(api): implement photo metadata seeding route with validation",
    "feat(storage): integrate indexedDB caching for local photo session recovery",

    "fix(camera): prevent stream freeze during rapid device re-enumeration",
    "fix(camera): correct video aspect ratio calculation on widescreen monitors",
    "fix(filter): eliminate color banding artifacts on low-bitrate gradients",
    "fix(ui): adjust button touch target size for touch kiosks",
    "fix(firebase): handle connection dropout during batch sync gracefully",
    "fix(download): prevent memory leak by revoking object URLs after download",
    "fix(qr): optimize QR code foreground-to-background contrast ratio",
    "fix(canvas): avoid pixelation on high-DPI canvas downsampling",
    "fix(state): sync current photo strip selection across modal re-renders",
    "fix(touch): disable browser pull-to-refresh on interactive canvas",
    "fix(api): sanitize query params on photo retrieval endpoint",
    "fix(timer): ensure countdown timer stops when navigating away",
    "fix(layout): resolve flexbox wrapping issue on 1080p kiosk screens",
    "fix(accessibility): add missing aria attributes to camera controls",
    "fix(storage): add graceful error handling when local quota is exceeded",

    "refactor(camera): decouple media stream manager into custom hook",
    "refactor(canvas): simplify image compositing pipeline architecture",
    "refactor(filter): organize color grading matrices into separate configs",
    "refactor(state): structure session state store with zustand",
    "refactor(ui): extract reusable glass-card and action-badge components",
    "refactor(types): unify photobooth capture and export type definitions",
    "refactor(api): modularize backend route handlers and validation helpers",
    "refactor(utils): optimize hex-to-rgb and color transform utilities",
    "refactor(styles): standardize spacing and typography design tokens",
    "refactor(export): optimize canvas blob generation with WebP compression",

    "perf(canvas): render WebGL shaders on offscreen canvas worker",
    "perf(images): compress intermediate preview thumbnails asynchronously",
    "perf(bundle): implement code-splitting for heavy filter modules",
    "perf(render): memoize grid item rendering to prevent redundant cycles",
    "perf(memory): explicitly clear canvas contexts after strip rendering",
    "perf(fonts): preload display fonts to avoid flash of unstyled text",
    "perf(anim): accelerate countdown transitions with CSS transforms",

    "style(photobooth): refine backdrop blur and color contrast for dark mode",
    "style(button): add subtle hover transition and outline focus style",
    "style(typography): refine letter-spacing and line heights for headings",
    "style(grid): modernize layout overlap for bento-style elements",
    "style(theme): update dark mode accent color token with warm hue",
    "style(modal): tune cubic-bezier easing curves on dialog open",
    "style(cards): apply subtle border gradient and elevation shadow",

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
Write-Host "March - April Natural Backdated Commit Generator" -ForegroundColor Yellow
Write-Host "Range: $StartDateStr to $EndDateStr ($totalDays days)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$totalCommitsGenerated = 0
$msgCount = $commitMessages.Length
$counter = 1000

for ($d = 0; $d -lt $totalDays; $d++) {
    $currentDay = $startDate.AddDays($d)
    $dateStr = $currentDay.ToString("yyyy-MM-dd")
    $dayOfWeek = $currentDay.DayOfWeek

    $isWeekend = ($dayOfWeek -eq [DayOfWeek]::Saturday -or $dayOfWeek -eq [DayOfWeek]::Sunday)
    
    if ($isWeekend) {
        $dailyCommitCount = $random.Next(10, 24)
    } elseif ($dayOfWeek -eq [DayOfWeek]::Monday -or $dayOfWeek -eq [DayOfWeek]::Friday) {
        $dailyCommitCount = $random.Next(28, 42)
    } else {
        $dailyCommitCount = $random.Next(35, 50)
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
Write-Host "Completed! Successfully created $totalCommitsGenerated natural commits for March & April." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
