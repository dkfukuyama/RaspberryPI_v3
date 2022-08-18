cd $PSScriptRoot;

Write-Host "Pre Build!"

Get-Content .env_test.* | Out-File .env -Force -encoding UTF8;
#Get-Content .env.* | Out-File .env -Force -encoding UTF8;