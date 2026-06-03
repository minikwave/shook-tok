# .env 파일의 Discord/Railway 변수를 Railway 서비스에 동기화합니다.
# 사용: .\scripts\sync-railway-env.ps1
# 필요: 루트 .env 에 DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID (선택 DISCORD_GUILD_ID)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
  Write-Error ".env 파일이 없습니다. .env.example 을 복사한 뒤 Discord 값을 채워주세요."
}

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '^\s*([^=]+)=(.*)$') { return }
  $key = $Matches[1].Trim()
  $val = $Matches[2].Trim().Trim('"').Trim("'")
  if ($val) { Set-Item -Path "env:$key" -Value $val }
}

$serviceId = "12b8d33e-3d7f-448c-b170-dacca55c4fc2"
$required = @("DISCORD_BOT_TOKEN", "DISCORD_CLIENT_ID")
$missing = $required | Where-Object { -not (Get-Item "env:$_" -ErrorAction SilentlyContinue) }
if ($missing.Count -gt 0) {
  Write-Error ("필수 변수 누락: " + ($missing -join ", "))
}

Push-Location $root
try {
  $pairs = @(
    "DISCORD_BOT_TOKEN=$env:DISCORD_BOT_TOKEN",
    "DISCORD_CLIENT_ID=$env:DISCORD_CLIENT_ID"
  )
  if ($env:DISCORD_GUILD_ID) {
    $pairs += "DISCORD_GUILD_ID=$env:DISCORD_GUILD_ID"
  }
  railway variable set @pairs -s $serviceId
  Write-Host "Railway 변수 동기화 완료. 재배포가 자동으로 시작됩니다."
  railway up --detach -s $serviceId
}
finally {
  Pop-Location
}
