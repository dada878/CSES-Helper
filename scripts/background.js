if (typeof browser === "undefined") var browser = chrome;

const getTags = (problemId) => {
    return new Promise((resolve, reject) => {
        fetch("https://github.com/dada878/CSES-Helper/blob/master/database/tags.json")
            .then(response => response.json())
            .then(data => {
                const content = data.payload.blob.rawLines.join("\n");
                tagsData = JSON.parse(content);
                resolve(tagsData[problemId]);
        });
    });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "fetch-tags") {
        getTags(request.problemId).then((tags) => {
            sendResponse({
                tags: tags ?? []
            });
        });
    }
    return true;
});