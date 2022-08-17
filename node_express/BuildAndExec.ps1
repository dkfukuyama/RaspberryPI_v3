cd $PSScriptRoot;

.\prebuild.ps1;
tsc --build;
.\postbuild.ps1;

node main_app.js


