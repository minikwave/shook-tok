# SHOOK/TOK 초기 설정 — .env 생성 → (선택) Railway 동기화 → 슬래시 명령 등록
# 사용: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envPath = Join-Path $root ".env"
$examplePath = Join-Path $root ".env.example"

Write-Host ""
Write-Host "=== SHOOK / TOK 설정 마법사 ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $envPath) {
  $overwrite = Read-Host ".env 가 이미 있습니다. 덮어쓸까요? (y/N)"
  if ($overwrite -ne "y" -and $overwrite -ne "Y") {
    Write-Host "기존 .env 를 사용합니다."
  } else {
    Copy-Item $examplePath $envPath -Force
  }
} else {
  Copy-Item $examplePath $envPath
  Write-Host ".env 파일을 생성했습니다."
}

Write-Host ""
Write-Host "Discord Developer Portal 을 여세요:" -ForegroundColor Yellow
Write-Host "  https://discord.com/developers/applications" -ForegroundColor Gray
Write-Host "  1) New Application → Bot → Reset Token" -ForegroundColor Gray
Write-Host "  2) General Information → Application ID" -ForegroundColor Gray
Write-Host "  3) OAuth2 URL Generator: bot + applications.commands" -ForegroundColor Gray
Start-Process "https://discord.com/developers/applications"

function Read-EnvValue {
  param([string]$Key, [string]$Prompt, [switch]$Optional)
  $current = (Get-Content $envPath -Raw) -match "(?m)^$Key=(.*)$" ? $Matches[1].Trim() : ""
  $hint = if ($current -and $current -notmatch '^\s*$') { " [Enter=유지: $($current.Substring(0, [Math]::Min(8, $current.Length)))...]" } else { "" }
  $input = Read-Host "$Prompt$hint"
  if (-not $input -and $current) { return $current }
  if (-not $input -and -not $Optional) {
    Write-Host "  (필수 — 나중에 .env 에 직접 넣어도 됩니다)" -ForegroundColor DarkYellow
    return ""
  }
  return $input.Trim()
}

$token = Read-EnvValue "DISCORD_BOT_TOKEN" "Bot Token"
$clientId = Read-EnvValue "DISCORD_CLIENT_ID" "Application ID (Client ID)"
$guildId = Read-EnvValue "DISCORD_GUILD_ID" "테스트 서버 ID (선택, 길드 전용 명령용)" -Optional
$dbUrl = Read-EnvValue "DATABASE_URL" "DATABASE_URL (Enter=Supabase pooler 예시 유지)" -Optional

$content = Get-Content $envPath -Raw
function Set-EnvLine {
  param([string]$Key, [string]$Value)
  if (-not $Value) { return }
  script:content = if ($content -match "(?m)^$Key=.*") {
    $content -replace "(?m)^$Key=.*", "$Key=$Value"
  } else {
    $content.TrimEnd() + "`n$Key=$Value`n"
  }
}

Set-EnvLine "DISCORD_BOT_TOKEN" $token
Set-EnvLine "DISCORD_CLIENT_ID" $clientId
if ($guildId) { Set-EnvLine "DISCORD_GUILD_ID" $guildId }
if ($dbUrl) { Set-EnvLine "DATABASE_URL" $dbUrl }

Set-Content -Path $envPath -Value $content.TrimEnd() -NoNewline
Add-Content -Path $envPath -Value ""

Write-Host ""
Write-Host ".env 저장 완료." -ForegroundColor Green

if (-not $token -or -not $clientId) {
  Write-Host ""
  Write-Host "Bot Token / Client ID 가 비어 있으면 Railway·로컬 봇을 시작할 수 없습니다." -ForegroundColor Yellow
  Write-Host ".env 를 채운 뒤 다시: .\scripts\setup.ps1" -ForegroundColor Yellow
  exit 1
}

Push-Location $root
try {
  if (-not (Test-Path "node_modules")) {
    Write-Host "pnpm install ..."
    pnpm install
  }

  $sync = Read-Host "Railway 에 변수 동기화 + 재배포? (Y/n)"
  if ($sync -ne "n" -and $sync -ne "N") {
    & (Join-Path $root "scripts\sync-railway-env.ps1")
  }

  $reg = Read-Host "슬래시 명령 등록 (pnpm commands:register)? (Y/n)"
  if ($reg -ne "n" -and $reg -ne "N") {
    pnpm commands:register
  }

  Write-Host ""
  Write-Host "초대 URL:" -ForegroundColor Cyan
  pnpm invite
  Write-Host ""
  Write-Host "점검: pnpm check:deploy" -ForegroundColor Cyan
}
finally {
  Pop-Location
}
