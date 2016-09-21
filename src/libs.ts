import * as express from "express";
export { express };

import * as crypto from "crypto";
export { crypto };

import * as childProcess from "child_process";

import * as request from "request";
export { request };

import * as bodyParser from "body-parser";
export { bodyParser };

export function exec(command: string) {
    return new Promise<void>((resolve, reject) => {
        childProcess.exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export const getPort: () => Promise<number> = require("get-port");

import * as minimist from "minimist";
export { minimist };

import * as __awaiter__ from "tslib";
export { __awaiter__ };

/**
 * operators: for github, it's name; for gitlab, it's id, can be found in the html
 */
export interface Application {
    repositoryName: string;
    robot: {
        secret: string;
    };
    commentDeploy: {
        operators: (string | number)[];
        command: string;
    };
    pullRequest: {
        testRootUrl: string;
        mergedCommand: string;
        openedCommand: string;
        closedCommand: string;
        updatedCommand: string;
    };
}
