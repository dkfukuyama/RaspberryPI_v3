cd $PSScriptRoot;

.\prebuild.ps1;
tsc --build;
.\postbuild.ps1;

ts-node main_app.ts -r tsconfig-paths/register


