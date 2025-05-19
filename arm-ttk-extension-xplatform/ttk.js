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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
var tl = require("azure-pipelines-task-lib/task");
var agentSpecific_1 = require("./agentSpecific");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var templateLocation, resultLocation, includeTests, skipTests, mainTemplates, allTemplatesAreMain, cliOutputResults, ignoreExitCode, recurse, azureServiceConnection, useAzBicep, verbose, executable, args, subscriptionId, clientId, clientSecret, tenantId, spawn, child;
        return __generator(this, function (_a) {
            try {
                templateLocation = tl.getInput("templateLocation", true);
                resultLocation = tl.getInput("resultLocation", true);
                includeTests = tl.getInput("includeTests");
                skipTests = tl.getInput("skipTests");
                mainTemplates = tl.getInput("mainTemplates");
                allTemplatesAreMain = tl.getBoolInput("allTemplatesAreMain");
                cliOutputResults = tl.getBoolInput("cliOutputResults");
                ignoreExitCode = tl.getBoolInput("ignoreExitCode");
                recurse = tl.getBoolInput("recurse");
                azureServiceConnection = tl.getInput("azureServiceConnection", false);
                useAzBicep = tl.getBoolInput("useAzBicep");
                verbose = (tl.getVariable("System.Debug") === "true");
                executable = "pwsh";
                if (tl.getVariable("AGENT.OS") === "Windows_NT") {
                    if (!tl.getBoolInput("usePSCore")) {
                        executable = "powershell.exe";
                    }
                    (0, agentSpecific_1.logInfo)("Using executable '".concat(executable, "'"));
                }
                else {
                    (0, agentSpecific_1.logInfo)("Using executable '".concat(executable, "' as only only option on '").concat(tl.getVariable("AGENT.OS"), "'"));
                }
                args = [__dirname + "\\powershell\\ps-runner.ps1"];
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
                if (useAzBicep) {
                    args.push("-useAzBicep");
                }
                if (azureServiceConnection !== undefined) {
                    subscriptionId = tl.getEndpointDataParameter(azureServiceConnection, "SubscriptionId", true);
                    clientId = tl.getEndpointAuthorizationParameter(azureServiceConnection, "serviceprincipalid", true);
                    clientSecret = tl.getEndpointAuthorizationParameter(azureServiceConnection, "serviceprincipalkey", true);
                    tenantId = tl.getEndpointAuthorizationParameter(azureServiceConnection, "tenantid", true);
                    if (subscriptionId !== undefined) {
                        args.push("-subscriptionId");
                        args.push(subscriptionId);
                    }
                    if (clientId !== undefined) {
                        args.push("-clientId");
                        args.push(clientId);
                    }
                    if (clientSecret !== undefined) {
                        args.push("-clientSecret");
                        args.push(clientSecret);
                    }
                    if (tenantId !== undefined) {
                        args.push("-tenantId");
                        args.push(tenantId);
                    }
                }
                (0, agentSpecific_1.logInfo)("".concat(executable, " ").concat(args.join(" ")));
                spawn = require("child_process").spawn;
                child = spawn(executable, args);
                child.stdout.on("data", function (data) {
                    (0, agentSpecific_1.logInfo)(data.toString());
                });
                child.stderr.on("data", function (data) {
                    var errorMessage = data.toString();
                    // Check if the error is a Bicep experimental feature warning
                    if (errorMessage.includes("WARNING: The following experimental Bicep features have been enabled")) {
                        // Log as warning instead of error
                        (0, agentSpecific_1.logWarning)(errorMessage);
                    }
                    else {
                        // Log other stderr output as errors
                        (0, agentSpecific_1.logError)(errorMessage);
                    }
                });
                child.on("exit", function () {
                    (0, agentSpecific_1.logInfo)("Script finished");
                });
            }
            catch (err) {
                (0, agentSpecific_1.logError)(err);
            }
            return [2 /*return*/];
        });
    });
}
run();
