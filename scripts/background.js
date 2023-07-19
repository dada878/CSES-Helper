if (typeof browser === "undefined") var browser = chrome;

const getFileFromGithub = (path) =>
    fetch(path)
        .then(response => response.json())
        .then(data => {
            const content = data.payload.blob.rawLines.join("\n");
            return JSON.parse(content);
        });

const getTags = (problemId) =>
    getFileFromGithub("https://github.com/dada878/CSES-Helper/blob/master/database/tags.json")
        .then(tagsData => tagsData[problemId]);

const getTips = (problemId) =>
    getFileFromGithub("https://github.com/dada878/CSES-Helper/blob/master/database/tips.json")
        .then(tipsData => tipsData[problemId]);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "fetch-tags") {
        getTags(request.problemId).then((tags) => {
            sendResponse({
                tags: tags ?? []
            });
        });
    } else if (request.command === "fetch-tips") {
        getTips(request.problemId).then((tips) => {
            sendResponse({
                tips: tips ?? []
            });
        });
    }
    return true;
});
