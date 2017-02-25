import * as libs from "./libs";

/**
 * the `applications` configurations,
 * you can set `repositoryName`, `secret` and so on.
 */
export const applications: libs.Application[] = [
    {
        repositoryName: "deploy-robot-demo",
        robot: {
            secret: "test secret",
        },
        commentDeploy: {
            operators: ["plantain-00"],
            command: "cd /opt/deploy-robot-demo/ && git pull",
        },
        pullRequest: {
            testRootUrl: "http://106.15.39.164",
            mergedCommand: "/opt/scripts/pr_merged.sh",
            openedCommand: "/opt/scripts/pr_opened.sh",
            closedCommand: "/opt/scripts/pr_closed.sh",
            updatedCommand: "/opt/scripts/pr_updated.sh",
        },
    },
];

export const commentActions: { filter: (comment: string) => boolean; getCommand: (application: libs.Application, request: libs.express.Request) => Promise<string> | string; }[] = [
    {
        filter: comment => comment.indexOf("robot") >= 0
            && comment.indexOf("deploy") >= 0
            && comment.indexOf("please") >= 0,
        getCommand: (application, issueCommentCreationContext) => {
            return application.commentDeploy.command;
        },
    },
];
