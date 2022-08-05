cd $PSScriptRoot;

Get-Content .env_test.* | Out-File .env -Force -encoding UTF8;