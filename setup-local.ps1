param(
    [string] $HrisPath = (Join-Path $PSScriptRoot '..\hris'),
    [string] $ProductionPath = (Join-Path $PSScriptRoot '..\production\application'),
    [string] $MarketingPath = (Join-Path $PSScriptRoot '..\marketing\temp_app'),
    [switch] $SeedDefaultAccounts,
    [switch] $SeedDemoData
)

$ErrorActionPreference = 'Stop'

$hrisSetup = Join-Path $HrisPath 'deploy\kubernetes\start-local.ps1'

foreach ($requiredPath in @($HrisPath, $ProductionPath, $MarketingPath, $hrisSetup)) {
    if (-not (Test-Path $requiredPath)) {
        throw "Required path was not found: $requiredPath"
    }
}

$arguments = @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', (Resolve-Path $hrisSetup).Path,
    '-ProductionPath', (Resolve-Path $ProductionPath).Path,
    '-MarketingPath', (Resolve-Path $MarketingPath).Path,
    '-CentralAdminPath', (Resolve-Path $PSScriptRoot).Path
)

if ($SeedDefaultAccounts) {
    $arguments += '-SeedDefaultAccounts'
}

if ($SeedDemoData) {
    $arguments += '-SeedDemoData'
}

Write-Host 'Starting the shared Imprint Kubernetes stack through HRIS setup...'
Write-Host "  HRIS:       $((Resolve-Path $HrisPath).Path)"
Write-Host "  Production: $((Resolve-Path $ProductionPath).Path)"
Write-Host "  Marketing:  $((Resolve-Path $MarketingPath).Path)"
Write-Host "  Admin:      $((Resolve-Path $PSScriptRoot).Path)"

& powershell.exe @arguments
if ($LASTEXITCODE -ne 0) {
    throw "The shared Kubernetes setup failed with exit code $LASTEXITCODE."
}
