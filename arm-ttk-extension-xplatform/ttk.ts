import tl = require("azure-pipelines-task-lib/task");


import {
    logInfo,
    logError,

}  from "./agentSpecific";

export async function run() {
    try {


        let templatelocation = tl.getInput("templatelocation", true);
        let resultlocation = tl.getInput("resultlocation", true);
        let testString = tl.getInput("testString");
        let skipString = tl.getInput("skipString");
        let mainTemplateString = tl.getInput("mainTemplateString");
        let allTemplatesAreMain = tl.getBoolInput("allTemplatesAreMain");
        let cliOutputResults = tl.getBoolInput("cliOutputResults");
        let ignoreExitCode = tl.getBoolInput("ignoreExitCode");
        let recurse = tl.getBoolInput("recurse");
       
        // we need to get the verbose flag passed in as script flag
        var verbose = (tl.getVariable("System.Debug") === "true");

        // find the executeable
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


        if (templatelocation) {
            args.push("-templatelocation");
            args.push(templatelocation);
        }

        if (resultlocation) {
            args.push("-resultlocation");
            args.push(resultlocation);
        }

        if (testString) {
            args.push("-testString");
            args.push(testString);
        }

        if (skipString) {
            args.push("-skipString");
            args.push(skipString);
        }

        if (mainTemplateString) {
            args.push("-mainTemplateString");
            args.push(mainTemplateString);
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