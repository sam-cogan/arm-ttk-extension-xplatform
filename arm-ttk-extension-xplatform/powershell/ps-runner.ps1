[CmdletBinding()] 
[CmdletBinding()]
Param(
    $templatelocation,
    $resultlocation,
    $TestString,
    $SkipString,
    $mainTemplateString,
    [switch]$allTemplatesAreMain,
    [switch]$cliOutputResults,
    [switch]$ignoreExitCode,
    [switch]$recurse
)
 
Import-Module "$PSScriptRoot\..\arm-ttk\arm-ttk.psd1"
Import-Module "$PSScriptRoot\Export-NUnitXml.psm1"
Import-Module "$PSScriptRoot\invoke-ttk.psm1"

if($TestString){
    $Test=$TestString.split(',').trim()
}
else{
    $Test =@()
}

if($SkipString){
    $Skip=$SkipString.split(',').trim()
}
else{
    $Skip =@()
}

if($mainTemplateString){
    $mainTemplates=$mainTemplateString.split(',').trim()
}
else{
    $mainTemplates =@()
}


Invoke-TTK -templatelocation $templatelocation  -resultlocation $resultlocation -Test $Test -Skip $Skip -mainTemplates $mainTemplates -allTemplatesAreMain $allTemplatesAreMain -cliOutputResults $cliOutputResults -ignoreExitCode $ignoreExitCode -recurse $recurse