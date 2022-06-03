[CmdletBinding()] 
[CmdletBinding()]
Param(
    $templateLocation,
    $resultLocation,
    $includeTests,
    $skipTests,
    $mainTemplates,
    [switch]$allTemplatesAreMain,
    [switch]$cliOutputResults,
    [switch]$ignoreExitCode,
    [switch]$recurse
)
 
Import-Module "$PSScriptRoot\..\arm-ttk\arm-ttk.psd1"
Import-Module "$PSScriptRoot\Export-NUnitXml.psm1"
Import-Module "$PSScriptRoot\invoke-ttk.psm1"

if($IncludeTests){
    $Test=$includeTests.split(',').trim()
}
else{
    $Test =@()
}

if($SkipTests){
    $Skip=$skipTests.split(',').trim()
}
else{
    $Skip =@()
}

if($MainTemplates){
    $Main=$mainTemplates.split(',').trim()
}
else{
    $Main =@()
}


Invoke-TTK -templateLocation $templateLocation  -resultLocation $resultLocation -Test $Test -Skip $Skip -mainTemplates $Main -allTemplatesAreMain $allTemplatesAreMain -cliOutputResults $cliOutputResults -ignoreExitCode $ignoreExitCode -recurse $recurse