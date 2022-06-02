"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const tl = require("azure-pipelines-task-lib/task");
const agentSpecific_1 = require("./agentSpecific");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let templatelocation = tl.getInput("templatelocation", true);
            let resultlocation = tl.getInput("resultlocation", true);
            let includeTests = tl.getInput("includeTests");
            let skipTests = tl.getInput("skipTests");
            let mainTemplates = tl.getInput("mainTemplates");
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
                (0, agentSpecific_1.logInfo)(`Using executable '${executable}'`);
            }
            else {
                (0, agentSpecific_1.logInfo)(`Using executable '${executable}' as only only option on '${tl.getVariable("AGENT.OS")}'`);
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
            (0, agentSpecific_1.logInfo)(`${executable} ${args.join(" ")}`);
            var spawn = require("child_process").spawn, child;
            child = spawn(executable, args);
            child.stdout.on("data", function (data) {
                (0, agentSpecific_1.logInfo)(data.toString());
            });
            child.stderr.on("data", function (data) {
                (0, agentSpecific_1.logError)(data.toString());
            });
            child.on("exit", function () {
                (0, agentSpecific_1.logInfo)("Script finished");
            });
        }
        catch (err) {
            (0, agentSpecific_1.logError)(err);
        }
    });
}
exports.run = run;
run();
