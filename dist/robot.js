"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const libs = require("./libs");
const github = require("./github");
const gitlab = require("./gitlab");
/**
 * the `applications` configurations,
 * you can set `repositoryName`, `secret` and so on.
 */
exports.applications = [];
/**
 * the mode handlers, there are `github` and `gitlab` handlers inside.
 * you can push other handers in it
 */
exports.handlers = { github, gitlab };
let handler;
exports.ports = {};
let onPortsUpdated = () => Promise.resolve();
/**
 * commands are designed be excuted one by one in a process globally.
 */
let isExecuting = false;
exports.commands = [];
let onCommandsUpdated = () => Promise.resolve();
function runCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isExecuting) {
            isExecuting = true;
            while (exports.commands.length > 0) {
                console.log(`there are ${exports.commands.length} commands.`);
                const firstCommand = exports.commands[0];
                try {
                    yield libs.exec(firstCommand.command);
                    const newCommands = [];
                    for (const c of exports.commands) {
                        if (c.command === firstCommand.command) {
                            yield handler.createComment("it's done now.", c.context);
                        }
                        else {
                            newCommands.push(c);
                        }
                    }
                    exports.commands = newCommands;
                    yield onCommandsUpdated();
                }
                catch (error) {
                    console.log(error);
                    yield handler.createComment(error, firstCommand.context);
                }
            }
            isExecuting = false;
        }
    });
}
function start(app, path, mode, options) {
    handler = exports.handlers[mode];
    if (!handler) {
        console.log(`mode "${mode}"" is not found in "handlers".`);
        process.exit(1);
    }
    if (options) {
        if (options.initialCommands) {
            exports.commands = options.initialCommands;
        }
        if (options.initialPorts) {
            exports.ports = options.initialPorts;
        }
        if (options.onCommandsUpdated) {
            onCommandsUpdated = options.onCommandsUpdated;
        }
        if (options.onPortsUpdated) {
            onPortsUpdated = options.onPortsUpdated;
        }
    }
    app.post(path, (request, response) => __awaiter(this, void 0, void 0, function* () {
        try {
            const repositoryName = handler.getRepositoryName(request);
            const application = exports.applications.find((value, index, obj) => value.repositoryName === repositoryName);
            if (!application) {
                response.end("name of repository is not found");
                return;
            }
            if (!exports.ports[repositoryName]) {
                exports.ports[repositoryName] = {};
                yield onPortsUpdated();
            }
            const signatureIsValid = handler.verifySignature(request, application);
            if (signatureIsValid) {
                response.end("signatures don't match");
                return;
            }
            const eventName = handler.getEventName(request);
            if (eventName === handler.issueCommentEventName) {
                const operator = handler.getIssueCommentOperator(request);
                if (application.operators.findIndex(value => value === operator) < 0) {
                    response.end("not valid operator");
                    return;
                }
                const comment = handler.getIssueComment(request);
                if (comment.indexOf("robot") >= 0
                    && comment.indexOf("deploy") >= 0
                    && comment.indexOf("please") >= 0) {
                    response.end("command accepted");
                    const context = handler.getCommentCreationContext(request, application, operator);
                    exports.commands.push({ command: application.deployCommand, context });
                    yield onCommandsUpdated();
                    yield handler.createComment("it may take a few minutes to finish it.", context);
                    yield runCommands();
                }
                else {
                    response.end("not a command");
                }
            }
            else if (eventName === handler.pullRequestEventName) {
                const action = handler.getPullRequestAction(request);
                const operator = handler.getPullRequestOperator(request);
                const pullRequestId = handler.getPullRequestId(request);
                const context = handler.getCommentCreationContext(request, application, operator);
                if (action === handler.pullRequestOpenActionName) {
                    const availablePort = yield libs.getPort();
                    exports.ports[repositoryName][pullRequestId] = pullRequestId;
                    yield onPortsUpdated();
                    exports.commands.push({ command: `${application.pullRequestOpenedCommand} ${availablePort}`, context });
                }
                else if (action === handler.pullRequestUpdateActionName) {
                    exports.commands.push({ command: application.pullRequestUpdatedCommand, context });
                }
                else if (handler.isPullRequestMerged) {
                    exports.commands.push({ command: application.pullRequestMergedCommand, context });
                }
                else if (handler.isPullRequestClosed) {
                    exports.commands.push({ command: application.pullRequestClosedCommand, context });
                }
                else {
                    response.end(`can not handle action: ${action}.`);
                    return;
                }
                yield onCommandsUpdated();
                yield handler.createComment("it may take a few minutes to finish it.", context);
                yield runCommands();
            }
            else {
                response.end(`can not handle event: ${eventName}.`);
            }
        }
        catch (error) {
            console.log(error);
            response.end(error.toString());
        }
    }));
}
exports.start = start;
//# sourceMappingURL=robot.js.map