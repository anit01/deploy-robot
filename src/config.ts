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
            command: "/opt/scripts/deploy.sh",
        },
        pullRequest: {
            getTestUrl(port, pullRequestId) {
                return `http://106.15.39.164:9000/${pullRequestId}/`;
            },
            mergedCommand: "/opt/scripts/pr_merged.sh",
            openedCommand: "/opt/scripts/pr_opened.sh",
            closedCommand: "/opt/scripts/pr_closed.sh",
            updatedCommand: "/opt/scripts/pr_updated.sh",
        },
    },
    {
        repositoryName: "deploy-robot-backend-demo",
        robot: {
            secret: "test secret",
        },
        commentDeploy: {
            operators: ["plantain-00"],
            command: "/opt/backend_scripts/deploy.sh",
        },
        pullRequest: {
            getTestUrl(port, pullRequestId) {
                return `http://106.15.39.164:${port}/api/`;
            },
            mergedCommand: "/opt/backend_scripts/pr_merged.sh",
            openedCommand: "/opt/backend_scripts/pr_opened.sh",
            closedCommand: "/opt/backend_scripts/pr_closed.sh",
            updatedCommand: "/opt/backend_scripts/pr_updated.sh",
        },
    },
];

export const commentActions: libs.CommentAction[] = [
    {
        filter: comment => comment.indexOf("robot") >= 0
            && comment.indexOf("deploy") >= 0
            && comment.indexOf("please") >= 0,
        getCommand: (application, issueCommentCreationContext) => {
            return application.commentDeploy.command;
        },
        gotMessage: "正在部署...",
        doneMessage: "部署已完成。",
    },
];

export const localeName = "zh-cn";
