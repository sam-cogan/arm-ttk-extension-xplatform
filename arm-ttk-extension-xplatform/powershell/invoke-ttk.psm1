
function Test-FolderContents {
    param(
        [string]$folder,
        [string]$filter,
        [boolean]$createResultsFiles,
        [string[]]$Test,
        [string[]]$Skip,
        [hashtable]$SkipByFile,
        [boolean]$mainTemplate
    )
    
    #Path is always set to folder due to limitation of ARMTTK, filter then picks file(s) or full folder to test
    if ($mainTemplate) {
        $results = Test-AzTemplate -TemplatePath "$folder\$filter" -Skip $Skip -Test $Test -SkipByFile $SkipByFile -mainTemplate $filter -ErrorAction  Continue
    }
    else {
        $results = Test-AzTemplate -TemplatePath "$folder\$filter" -Skip $Skip -Test $Test -SkipByFile $SkipByFile -ErrorAction Continue
    }
    if ($createResultsFiles) {
        Export-NUnitXml -TestResults $results -Path $resultlocation
    }

    if (!$results) { 
        return 0
    }
        
    return $($results.passed | Where-Object { $_ -eq $false } | Measure-Object).Count
}

Function Invoke-TTK {
    <#
.SYNOPSIS
    Runs the ARM TTK against the provided test files
#>
    [CmdletBinding()]
    Param (
        # Object containing all test results
        [Parameter(Mandatory, Position = 0)]
        [AllowNull()]
        [string]$templatelocation,
        # Path to store results
        [Parameter(Mandatory, Position = 1)]
        [string]$resultlocation,
        # Whether to create test result files
        [boolean]$createResultsFiles = $true,
        # List of tests to run, if provided will only run these tests
        [Alias('Tests')]
        [string[]]$Test,
        # List of tests to skip
        [string[]]$Skip,
        # Dictionary of file patterns to test patterns to skip
        [hashtable]$SkipByFile,
        # List of files to treat as main templates
        [string[]]$MainTemplates,
        # treat all templates as main template
        [boolean]$allTemplatesAreMain = $false,
        # Whether to provide summary outputs at the CLI
        [boolean]$cliOutputResults = $false,
        # Whether to ignore exit code and always pass task
        [boolean]$ignoreExitCode = $false,
        # Whether to check all subfolders of template path for arm/bicep files
        # Defaults to true to preserve backwards compatability
        [boolean]$recurse = $true,
        [string] $subscriptionId,
        [string] $clientId,
        [string] $clientSecret,
        [string] $tenantId,
        [boolean] $useAzBicep = $false

    )

    if($subscriptionId -and $clientId -and $clientSecret -and $tenantId ){
        az login --service-principal -u $clientId -p $clientSecret --tenant $tenantId

    }


    ### Test Paths
    try {
        $item = Get-Item $templatelocation
    }
    catch {
        Write-Error "Template Location is not an existing folder, file or wildcard"
    }
    #If a folder has been passed in set the template location to a wildcard for that folder
    if ($item -is [System.IO.DirectoryInfo]) {
        $templatelocation = "$($templatelocation.Trimend('\'))\*"
    }

    if($recurse){
        $bicepFiles = Get-ChildItem $templatelocation -include "*.bicep" -Recurse
    }
    else{
        $bicepFiles = Get-ChildItem $templatelocation -include "*.bicep" 
    }

    if($bicepFiles.count -gt 0){
        if($useAzBicep){
            $bicepCommand = "az bicep"
        }
        else {
            if($isWindows){
                    if ((Get-Command "bicep.exe" -ErrorAction SilentlyContinue) -eq $null -and (Get-Command "$PSScriptRoot\bicep.exe" -ErrorAction SilentlyContinue) -eq $null) {
                    write-Host "Bicep Not Found, Downloading Bicep for Windows..."
                    (New-Object Net.WebClient).DownloadFile("https://github.com/Azure/bicep/releases/latest/download/bicep-win-x64.exe", "$PSScriptRoot\bicep.exe")
                    }
                    $bicepCommand = "bicep.exe"
                    if((Get-Command "bicep" -ErrorAction SilentlyContinue) -eq $null){
                        $bicepCommand = "$PSScriptRoot\bicep.exe"
                    }
                }
            if($isLinux){
                if ((Get-Command "bicep" -ErrorAction SilentlyContinue) -eq $null -and (Get-Command "$PSScriptRoot/bicep" -ErrorAction SilentlyContinue) -eq $null) {
                write-Host "Bicep Not Found, Downloading Bicep for Linux..."
                (New-Object Net.WebClient).DownloadFile("https://github.com/Azure/bicep/releases/latest/download/bicep-linux-x64", "$PSScriptRoot/bicep")
                chmod +x "$PSScriptRoot/bicep"
                }
                $bicepCommand = "bicep"
                if((Get-Command "bicep" -ErrorAction SilentlyContinue) -eq $null){
                    $bicepCommand = "$PSScriptRoot/bicep"
                }
            }
        }
 
        foreach($bicepFile in $bicepFiles){
            if($useAzBicep){
            $cmd = "$bicepCommand build --file $bicepFile"
            }
            else {
                $cmd = "$bicepCommand build $bicepFile"
            }
            invoke-expression $cmd
        }
        if (!($item -is [System.IO.DirectoryInfo])) {
            $templatelocation = $templatelocation.replace(".bicep",".json")
        }
    }

    if($recurse){
        $files = Get-ChildItem $templatelocation -include "*.json", "*.jsonc" -Recurse
    }
    else{
        $files = Get-ChildItem $templatelocation -include "*.json", "*.jsonc"
    }

    $totalFileCount = $files.count

    if ($totalFileCount -lt 1) {
        Write-Error "No json files found in provided path"
    }

    $FailedNumber = 0
    foreach ($file in $files) {
        $fileInfo = [System.IO.FileInfo]$file    
        $mainTemplate = $false
        if (($mainTemplates -contains $fileInfo.name) -or $allTemplatesAreMain) {
            $mainTemplate = $true    
        }
        #hack to skip this test temporarily, as it causes errors in PowerShell 5
        $skip = $skip += "Secure-Params-In-Nested-Deployments"
        $failedTests = Test-FolderContents -folder $fileInfo.Directory.FullName -filter $fileInfo.Name -createResultsFiles $createResultsFiles -Test $Test -Skip $Skip -SkipByFile $SkipByFile -mainTemplate $mainTemplate
        $FailedNumber += $failedTests
        if ($cliOutputResults) {
            if ($failedTests -gt 0) {
                Write-Host "##[warning] $file failed $failedTests test"
            }
            else {
                Write-Host "##[section] $file passed all tests" -ForegroundColor Green
            }
        }
    }

    if ($FailedNumber -gt 0)  {
        if($ignoreExitCode){
            write-host "Failures found in test results but ignoring exit code"
        }
        else {
            throw "Failures found in test results"
        }
        
        
    }
    
    if($subscriptionId -and $clientId -and $clientSecret -and $tenantId ){
        az account clear
    }
}