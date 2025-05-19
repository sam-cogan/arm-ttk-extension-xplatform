"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = logDebug;
exports.logWarning = logWarning;
exports.logInfo = logInfo;
exports.logError = logError;
exports.writeVariable = writeVariable;
exports.getSystemAccessToken = getSystemAccessToken;
var tl = require("azure-pipelines-task-lib/task");
// moving the logging function to a separate file
function logDebug(msg) {
    tl.debug(msg);
}
function logWarning(msg) {
    tl.warning(msg);
}
function logInfo(msg) {
    console.log(msg);
}
function logError(msg) {
    tl.error(msg);
    tl.setResult(tl.TaskResult.Failed, msg);
}
function writeVariable(variableName, value) {
    if (variableName) {
        logInfo("Writing output variable ".concat(variableName));
        // the newlines cause a problem only first line shown
        // so remove them
        var newlineRemoved = value.replace(/\n/gi, "`n");
        tl.setVariable(variableName, newlineRemoved);
    }
}
function getSystemAccessToken() {
    tl.debug("Getting credentials the agent is running as");
    var auth = tl.getEndpointAuthorization("SYSTEMVSSCONNECTION", false);
    if ((auth === null || auth === void 0 ? void 0 : auth.scheme) === "OAuth") {
        tl.debug("Found an OAUTH token");
        return auth === null || auth === void 0 ? void 0 : auth.parameters["AccessToken"];
    }
    else {
        tl.warning(tl.loc("BuildCredentialsWarn"));
        return "";
    }
}
