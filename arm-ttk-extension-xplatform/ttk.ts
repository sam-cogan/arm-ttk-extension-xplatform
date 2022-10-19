import tl = require("azure-pipelines-task-lib/task");


import {
    logInfo,
    logError,

}  from "./agentSpecific";

export async function run() {
    try {


        let templateLocation = tl.getInput("templateLocation", true);
        let resultLocation = tl.getInput("resultLocation", true);
        let includeTests = tl.getInput("includeTests");
        let skipTests = tl.getInput("skipTests");
        let mainTemplates = tl.getInput("mainTemplates");
        let allTemplatesAreMain = tl.getBoolInput("allTemplatesAreMain");
        let cliOutputResults = tl.getBoolInput("cliOutputResults");
        let ignoreExitCode = tl.getBoolInput("ignoreExitCode");
        let recurse = tl.getBoolInput("recurse");
        let azureServiceConnection = tl.getInput("azureServiceConnection",false)

    
        // we need to get the verbose flag passed in as script flag
        var verbose = (tl.getVariable("System.Debug") === "true");

        // find the executable
        let executable = "pwsh";
        if (tl.getVariable("AGENT.OS") === "Windows_NT") {
            if (!tl.getBoolInput("usePSCore")) {
                executable = "powershell.exe";
            }
            logInfo(`Using executable '${executable}'`);
        } else {
            logInfo(`Using executable '${executable}' as only only option on '${tl.getVariable("AGENT.OS")}'`);
        }

        // we need to not pass the null param
        var args = [__dirname + "\\powershell\\ps-runner.ps1"];


        if (templateLocation) {
            args.push("-templateLocation");
            args.push(templateLocation);
        }

        if (resultLocation) {
            args.push("-resultLocation");
            args.push(resultLocation);
        }

        if (includeTests) {
            args.push("-includeTests");
            args.push(includeTests);
        }

        if (skipTests) {
            args.push("-skipTests");
            args.push(skipTests);
        }

        if (mainTemplates) {
            args.push("-mainTemplates");
            args.push(mainTemplates);
        }

        if (allTemplatesAreMain) {
            args.push("-allTemplatesAreMain");
        }

        if (cliOutputResults) {
            args.push("-cliOutputResults");
     
        }

        if (ignoreExitCode) {
            args.push("-ignoreExitCode");

        }
        if (recurse) {
            args.push("-recurse");
        }

        
        if(azureServiceConnection !== undefined){

            let subscriptionId = tl.getEndpointDataParameter(azureServiceConnection, "SubscriptionId", true )
            let clientId =  tl.getEndpointAuthorizationParameter(azureServiceConnection, "serviceprincipalid", true )
            let clientSecret = tl.getEndpointAuthorizationParameter(azureServiceConnection, "serviceprincipalkey", true )
            let tenantId =  tl.getEndpointAuthorizationParameter(azureServiceConnection, "tenantid", true )
            
            if(subscriptionId !== undefined){
                args.push("-subscriptionId");
                args.push(subscriptionId);
            }
            if(clientId  !== undefined){
                args.push("-clientId");
                args.push(clientId );
            }
            if(clientSecret !== undefined){
                args.push("-clientSecret");
                args.push(clientSecret);
            }
            if(tenantId !== undefined){
                args.push("-tenantId");
                args.push(tenantId);
            }
        }

        logInfo(`${executable} ${args.join(" ")}`);

        var spawn = require("child_process").spawn, child;
        child = spawn(executable, args);
        child.stdout.on("data", function (data: any) {
            logInfo(data.toString());
        });
        child.stderr.on("data", function (data: any) {
            logError(data.toString());
        });
        child.on("exit", function () {
            logInfo("Script finished");
        });
    }
    catch (err) {
        logError(err as string);
    }
}

run();