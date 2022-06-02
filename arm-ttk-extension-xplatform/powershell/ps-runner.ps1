[CmdletBinding()] 
[CmdletBinding()]
Param(
    $templatelocation,
    $resultlocation,
    $IncludeTests,
    $SkipTests,
    $MainTemplates,
    [switch]$allTemplatesAreMain,
    [switch]$cliOutputResults,
    [switch]$ignoreExitCode,
    [switch]$recurse
)
 
Import-Module "$PSScriptRoot\..\arm-ttk\arm-ttk.psd1"
Import-Module "$PSScriptRoot\Export-NUnitXml.psm1"
Import-Module "$PSScriptRoot\invoke-ttk.psm1"

if($IncludeTests){
    $Test=$IncludeTests.split(',').trim()
}
else{
    $Test =@()
}

if($SkipTests){
    $Skip=$SkipTests.split(',').trim()
}
else{
    $Skip =@()
}

if($MainTemplates){
    $mainTemplates=$MainTemplates.split(',').trim()
}
else{
    $mainTemplates =@()
}


Invoke-TTK -templatelocation $templatelocation  -resultlocation $resultlocation -Test $Test -Skip $Skip -mainTemplates $mainTemplates -allTemplatesAreMain $allTemplatesAreMain -cliOutputResults $cliOutputResults -ignoreExitCode $ignoreExitCode -recurse $recurse