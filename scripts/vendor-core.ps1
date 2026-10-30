<#
.SYNOPSIS
    Copie la distribution ESM de @fas/webserial-core dans src/vendor/webserial-core/.

.DESCRIPTION
    Sans parametre, clone la branche cible dans un dossier temporaire et copie son dossier
    dist/. Avec -Source, copie depuis un clone local deja present (utile pour tester une
    version non poussee).

.EXAMPLE
    pwsh ./scripts/vendor-core.ps1

.EXAMPLE
    pwsh ./scripts/vendor-core.ps1 -Source C:\data\github_repo\webserial_instrument-core -IncludeSourceMaps
#>
[CmdletBinding()]
param(
    [string]$Source,
    [string]$Repo = 'https://github.com/PE-FAS-IND/webserial_instrument-core.git',
    [string]$Branch = 'feat/typescript-core',
    [switch]$IncludeSourceMaps
)

$ErrorActionPreference = 'Stop'

$target = Join-Path $PSScriptRoot '..\src\vendor\webserial-core' | Resolve-Path
$readme = Join-Path $target 'README.md'
$temp = $null

try {
    if (-not $Source) {
        $temp = Join-Path ([System.IO.Path]::GetTempPath()) ("wsi-core-" + [guid]::NewGuid().ToString('N'))
        Write-Host "Clonage de $Repo ($Branch)..."
        git clone --depth 1 --branch $Branch $Repo $temp --quiet
        $Source = $temp
    }

    $dist = Join-Path $Source 'dist'
    if (-not (Test-Path $dist)) {
        throw "Dossier dist introuvable dans '$Source'. Lancez 'npm run build' dans le depot de la librairie."
    }

    Write-Host "Nettoyage de $target..."
    Get-ChildItem $target -Force | Where-Object { $_.FullName -ne $readme } | Remove-Item -Recurse -Force

    Write-Host 'Copie de la distribution...'
    Copy-Item (Join-Path $dist '*') $target -Recurse -Force

    if (-not $IncludeSourceMaps) {
        # Les .map referencent des chemins src/ absents du deploiement : 404 inutiles en production.
        Get-ChildItem $target -Recurse -Filter '*.map' | Remove-Item -Force
    }

    $count = (Get-ChildItem $target -Recurse -File).Count
    Write-Host "Termine : $count fichiers dans src/vendor/webserial-core/."
}
finally {
    if ($temp -and (Test-Path $temp)) { Remove-Item $temp -Recurse -Force }
}
