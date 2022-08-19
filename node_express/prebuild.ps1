cd $PSScriptRoot;

Write-Host "Pre Build!"

if($Args[0] -eq "TEST"){
	Get-Content .env_test.* | Out-File .env -Force -encoding UTF8;
}elseif($Args[0] -eq "CLEAN"){
	ls -r -File |? {$_.FullName -notmatch "\\node_modules\\" -and  $_.Name -match "\.js$|\.js\.map$"} | Remove-Item;
	Get-Content .env.* | Out-File .env -Force -encoding UTF8;
}else{
	Get-Content .env.* | Out-File .env -Force -encoding UTF8;
}