
[CmdletBinding()]
Param(
    $templateLocation,
    $resultLocation,
    $includeTests,
    $skipTests,
    $skipTestsByFile,
    $mainTemplates,
    [switch]$allTemplatesAreMain,
    [switch]$cliOutputResults,
    [switch]$ignoreExitCode,
    [switch]$recurse,
    [string] $subscriptionId,
    [string] $clientId,
    [string] $clientSecret,
    [string] $tenantId,
    [switch] $useAzBicep
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

# Process skipTestsByFile parameter
$SkipByFile = @{}
if($skipTestsByFile){
    # Format: 'filePattern1:testPattern1,filePattern2:testPattern2'
    $fileTestPairs = $skipTestsByFile.split(',').trim()
    foreach($pair in $fileTestPairs){
        if($pair.Contains(':')){
            $parts = $pair.split(':',2)
            $filePattern = $parts[0].trim()
            $testPattern = $parts[1].trim()
            if($filePattern -and $testPattern){
                $SkipByFile[$filePattern] = $testPattern
            }
        }
    }
}


Invoke-TTK -templateLocation "$templateLocation"  -resultLocation "$resultLocation" -Test $Test -Skip $Skip -SkipByFile $SkipByFile -mainTemplates $Main -allTemplatesAreMain $allTemplatesAreMain -cliOutputResults $cliOutputResults -ignoreExitCode $ignoreExitCode -recurse $recurse -subscriptionId $subscriptionId -clientId $clientId -clientSecret $clientSecret -tenantId $tenantId -useAzBicep $useAzBicep