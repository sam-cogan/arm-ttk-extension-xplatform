# arm-ttk-extension

![CI](https://github.com/sam-cogan/arm-ttk-extension-xplatform/workflows/CI/badge.svg)

An Azure DevOps Extension for running Azure Resource Manager Template Tool Kit tests as part of your build or release pipeline.

This extension works on Windows and Linux build agents, so long as PowerShell core is present

## ARM TTK
The ARM Template Tool Kit is a new static code analyser for ARM templates created by Microsoft. It's an open-source PowerShell library that you can use to validate your templates against a series of test cases. These test cases are generic and designed to validate that your templates are following best practice, a little like the PowerShell PSScriptAnalyzer tool. The ARM TTK tests for things like:

- Templates are using a valid schema
- Locations are not hardcoded
- Outputs don't contain secrets
- ID's are derived from resource ID's
- Templates do not contain blanks

For full details of the ARM TTK visit it's [Git repository](https://github.com/Azure/arm-ttk)

## ARM TTK Extension
This extension provides an easy way to run the ARM TTK tests against your templates within Azure DevOps. You could run these tests when you update your template repository, create a pull request against your template repositor or when you are looking to run your templtes to create infrastructure.

### Parameters

This extension expects two parameters

1. The path to the files you want to test. This can be a folder (all templates in the folder will be tested), a single file, or a path using a wildcard. You do not need to filter out non-templates, the extension will do this for you. The extension supports json, jsonc and bicep files.
2. The path to output the test results format. This extension outputs the results of all tests in nunit 2 format XML files, one file per file tested. These files use the format "<testFileName>-armttk.xml"

You can also provide these optional parameters:

1. A comma-separated list of tests to run, if you provide this list, only the tests provided will be run, and all other tests will be skipped. Leave blank to run all tests. If the test names are incorrect, then all tests will run. The complete list of test case names can be found in the ARMTTK [here](https://github.com/Azure/arm-ttk/tree/master/arm-ttk/testcases/deploymentTemplate).
2. A comma-separated list of tests to skip, all other tests will be run. Leave blank to run all tests. The complete list of test case names can be found in the ARMTTK [here](https://github.com/Azure/arm-ttk/tree/master/arm-ttk/testcases/deploymentTemplate).
3. A comma-separated list of files to treat as the "main template" for the purpose of tests that require this, such as the "Location must not be hardcoded" test.
4. A boolean to indicate whether to treat all templates as the "main template" for the purpose of tests that require this, such as the "Location must not be hardcoded" test - defaults to false.
5. A boolean to output additional test result summary to the Azure DevOps CLI - defaults to false.
6. A boolean to indicate whether we should recurse through subfolders to find files to test - defaults to true
7. A boolean to indicate whether we should ignore the exit code of the tests and so not fail the build on a failed test (advanced section)
8. A boolean to indicate whether we should use PowerShell Core on Windows machines. On Linux, PowerShell core will always be used (advanced section)
9. An Azure RM service connection providing credentials to connect to Azure for testing code that uses Bicep Module Registries or Template Specs
10. A boolean to indicate whether to use the Azure CLI version of bicep (Az Bicep) instead of the standard Bicep.exe. The Az CLI must be installed and the ```az bicep install``` command needs to be run prior to running tests, the extension will not install it for you. If you leave this set to false the extension will install Bicep.exe for you if needed.
```yaml
- task: RunARMTTKTestsXPlat@1
  inputs:
    templatelocation: '$(System.DefaultWorkingDirectory)\templates'
    resultLocation: '$(System.DefaultWorkingDirectory)\results'
    includeTests: 'VM Images Should Use Latest Version,Resources Should Have Location'
    skipTests: 'VM Images Should Use Latest Version,Resources Should Have Location'
    mainTemplates: 'template1.json, template2.json'
    allTemplatesMain: false
    cliOutputResults: true
    recurse: true
    ignoreExitCode: false
    usePSCore: true
    azureServiceConnection: serviceConnectionName
    useAzBicep: false
```

### Test Results

This extension does not publish the tests results to show in the Azure DevOps UI its self, you need to use the "Publish Test Results" extension to read the XML files and publish the results so you can see a test report in the UI. All you need to do is pass the results folder path with a filter looking for armttk results files, e.g:

```yaml
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'NUnit'
    testResultsFiles: '$(System.DefaultWorkingDirectory)\results\*-armttk.xml'
  condition: always()
```
If any of your tests fail, the RunARMTTKTests task will also fail. To ensure that you always publish your test results make sure you use the ```condition: always()``` setting so this always runs.

Once you do this, Azure DevOps will show the results of your tests in the build.

![Test Results](https://raw.githubusercontent.com/sam-cogan/arm-ttk-extension-xplatform/main/images/TestResults.png)


## License

This extension uses the [MIT License](LICENSE)
