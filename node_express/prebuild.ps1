cd $PSScriptRoot;

Write-Host "Pre Build START!"
Write-Host ("Current Dir :: " + (Get-Location).Path);

Get-Content .env_test.* | Out-File .env_test -Force -encoding UTF8;
Get-Content .env.* | Out-File .env -Force -encoding UTF8;

if($Args[0] -eq "CLEAN"){
	ls -r -File |? {$_.FullName -notmatch "\\node_modules\\" -and  $_.Name -match "\.js$|\.js\.map$"} | Remove-Item;
	#tsc --build --clean
	#Write-Host "tsc --build --clean"
}else{
	tsc --build
	Write-Host "tsc --build"
}


