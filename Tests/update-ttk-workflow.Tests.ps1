Describe "Update TTK workflow" {
    BeforeAll {
        # Sample content that simulates the files we need to modify
        $expandAzTemplateContent = @'
        # Then, go looking beneath that template path
        $preferredJsonFile = $TemplatePath |
            Get-ChildItem -Filter *.json |
            # for a file named azuredeploy.json, prereq.azuredeploy.json or mainTemplate.json
            Where-Object { 'azuredeploy.json', 'mainTemplate.json', 'prereq.azuredeploy.json' -contains $_.Name } |
            Select-Object -First 1 -ExpandProperty Fullname
'@

        $testAzTemplateContent = @'
        # attempt to find one in the current directory and it's subdirectories
        $possibleJsonFiles = @(Get-ChildItem -Filter *.json -Recurse |
            Sort-Object Name -Descending | # (sort by name descending so that MainTemplate.json comes first).
                Where-Object {
                    'azureDeploy.json', 'mainTemplate.json' -contains $_.Name
                })
'@

        $commentedExpandAzTemplateContent = @'
        # Then, go looking beneath that template path
        $preferredJsonFile = $TemplatePath |
            Get-ChildItem -Filter *.json |
            # for a file named azuredeploy.json, prereq.azuredeploy.json or mainTemplate.json
            # Where-Object { 'azuredeploy.json', 'mainTemplate.json', 'prereq.azuredeploy.json' -contains $_.Name } |
            Select-Object -First 1 -ExpandProperty Fullname
'@

        $commentedTestAzTemplateContent = @'
        # attempt to find one in the current directory and it's subdirectories
        $possibleJsonFiles = @(Get-ChildItem -Filter *.json -Recurse |
            Sort-Object Name -Descending) # | # (sort by name descending so that MainTemplate.json comes first).
                #Where-Object {
                #    'azureDeploy.json', 'mainTemplate.json' -contains $_.Name
                #})
'@
    }

    Context "Line-by-line updates for Expand-AzTemplate.ps1" {
        It "Should comment out Where-Object line in Expand-AzTemplate.ps1" {
            # Split into lines
            $lines = $expandAzTemplateContent -split "`n"
            
            # Find and process the line with Where-Object
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "Where-Object") {
                    if ($lines[$i] -notmatch "^\s*#") {
                        $lines[$i] = "# " + $lines[$i].TrimStart()
                    }
                }
            }
            
            # Join back into content
            $result = $lines -join "`n"
            
            # Get the line with Where-Object
            $whereObjectLine = ($result -split "`n" | Where-Object { $_ -match "Where-Object" })
            $whereObjectLine | Should -Match "^# Where-Object"
        }
    }

    Context "Line-by-line updates for Test-AzTemplate.ps1" {
        It "Should modify Sort-Object and comment out Where-Object block in Test-AzTemplate.ps1" {
            # Split into lines
            $lines = $testAzTemplateContent -split "`n"
            $inWhereObjectBlock = $false
            
            # Process lines
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "Sort-Object Name -Descending \|") {
                    # Replace the pipe with parenthesis and comment
                    $lines[$i] = $lines[$i] -replace "\|", ") #|"
                    $inWhereObjectBlock = $true
                    continue
                }
                
                # If in a Where-Object block, comment out lines
                if ($inWhereObjectBlock) {
                    if ($lines[$i] -notmatch "^\s*#") {
                        $lines[$i] = "#" + $lines[$i]
                    }
                    
                    # Check for end of block
                    if ($lines[$i] -match "\)\)$") {
                        $inWhereObjectBlock = $false
                    }
                }
            }
            
            # Join back into content
            $result = $lines -join "`n"
            
            # Check if Sort-Object line has parenthesis instead of pipe
            $sortLine = ($result -split "`n" | Where-Object { $_ -match "Sort-Object" })
            $sortLine | Should -Match "\)"
            $sortLine | Should -Not -Match "\|\s+Where-Object" # Should not have a pipe followed by Where-Object
            
            # Check that Where-Object lines are commented out
            $whereObjectLine = ($result -split "`n" | Where-Object { $_ -match "Where-Object" })
            $whereObjectLine | Should -Match "^#"
        }
    }

    Context "Version update logic" {
        It "Should correctly increment minor version in version string" {
            $versionString = "ModuleVersion = 0.25"
            $pattern = 'ModuleVersion\s*=\s*(\d+\.\d+)'
            $match = [regex]::Match($versionString, $pattern)
            
            $match.Success | Should -BeTrue
            $currentVersion = $match.Groups[1].Value
            $versionParts = $currentVersion.Split('.')
            $majorVersion = [int]$versionParts[0]
            $minorVersion = [int]$versionParts[1]
            
            $minorVersion++ 
            $newVersion = "$majorVersion.$minorVersion"
            $newVersion | Should -Be "0.26"
            
            $newContent = $versionString -replace $pattern, "ModuleVersion = $newVersion"
            $newContent | Should -Be "ModuleVersion = 0.26"
        }
    }
}