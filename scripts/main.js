if (typeof browser === "undefined") var browser = chrome;

const getTags = async (problemId) => {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage({
            command: "fetch-tags",
            problemId: problemId
        }).then((response) => {
            resolve(response.tags);
        });
    });
}

const problemId = window.location.href.split("/").at(-1);
const navbarElement = document.querySelector(".nav");
const sidebarElement = document.querySelector(".nav.sidebar");

const createTagsSectionOnSidebar = async () => {
    const dividerLine = document.createElement("hr");
    const sectionTitle = document.createElement("h4");
    sectionTitle.innerHTML = "Tags";
    const showTags = document.createElement("details");
    const showTagsSummary = document.createElement("summary");
    const tagsList = await getTags(problemId);
    const tagsListElement = document.createElement("ul");
    tagsList.forEach((tag) => {
        const tagElement = document.createElement("li");
        tagElement.innerHTML = tag;
        tagsListElement.appendChild(tagElement);
    });
    showTags.appendChild(tagsListElement);
    showTagsSummary.innerHTML = "Show Problem Tags";
    showTags.appendChild(showTagsSummary);
    sidebarElement.insertBefore(dividerLine, sidebarElement.firstChild);
    sidebarElement.insertBefore(showTags, sidebarElement.firstChild);
    sidebarElement.insertBefore(sectionTitle, sidebarElement.firstChild);
}

createTagsSectionOnSidebar();