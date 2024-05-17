if (typeof browser === "undefined") var browser = chrome;

const chromeStorage = chrome.storage.local;


const problemId = document.querySelector(".nav").children[0].firstChild.href.split("/").at(-2);
const navbarElement = document.querySelector(".nav");
const sidebarElement = document.querySelector(".nav.sidebar");
const topics = [];
const problemset = {};

const getTags = (problemId) =>
    browser.runtime.sendMessage({
        command: "fetch-tags",
        problemId: problemId
    }).then(response => response.tags);

const getTips = (problemId) =>
    browser.runtime.sendMessage({
        command: "fetch-tips",
        problemId: problemId
    }).then(response => response.tips);

const createTagsSectionOnSidebar = async () => {
    const container = document.createElement("div");
    container.id = "tags-container";
    sidebarElement.insertBefore(container, sidebarElement.firstChild);
    const dividerLine = document.createElement("hr");
    const sectionTitle = document.createElement("h4");
    sectionTitle.style.margin = "0.1em 0 0.5em 0";
    sectionTitle.innerHTML = "Tags";
    const showTags = document.createElement("details");
    showTags.id = "show-tags";
    const showTagsSummary = document.createElement("summary");
    const tagsListElement = document.createElement("ul");
    tagsListElement.id = "tags"
    tagsListElement.style.marginTop = "5px";
    showTags.appendChild(tagsListElement);
    showTagsSummary.innerHTML = "Show Problem Tags";
    showTags.appendChild(showTagsSummary);
    container.insertBefore(dividerLine, container.firstChild);
    container.insertBefore(showTags, container.firstChild);
    container.insertBefore(sectionTitle, container.firstChild);

    const tagsList = await getTags(problemId);
    console.log(tagsList);

    if (tagsList.length == 0) {
        const noTagsElement = document.createElement("p");
        noTagsElement.style.margin = "0px";
        noTagsElement.innerHTML = "No Tags";
        document.getElementById("show-tags").outerHTML = noTagsElement.outerHTML;
        return;
    }

    tagsList.forEach((tag) => {
        const tagElement = document.createElement("li");
        tagElement.innerHTML = tag;
        document.getElementById("tags").appendChild(tagElement);
    });
}

const createTipsSectionOnSidebar = async () => {
    const container = document.createElement("div");
    container.id = "tips-container";
    const sectionTitle = document.createElement("h4");
    const dividerLine = document.createElement("hr");
    sectionTitle.innerHTML = "Tips";
    sectionTitle.style.margin = "0.6em 0 0.5em 0";
    container.insertBefore(dividerLine, container.firstChild);
    container.insertBefore(sectionTitle, container.firstChild);
    sidebarElement.insertBefore(container, sidebarElement.firstChild);

    const containerRef = document.getElementById("tips-container");

    const tips = await getTips(problemId);

    if (tips.length == 0) {
        const noTipsElement = document.createElement("p");
        noTipsElement.style.margin = "0px";
        noTipsElement.innerHTML = "No Tips";
        containerRef.insertBefore(noTipsElement, containerRef.firstChild.nextSibling);
        return;
    }

    tips.reverse().forEach((tip, index) => {
        const showTips = document.createElement("details");
        const showTipsSummary = document.createElement("summary");
        showTipsSummary.innerHTML = "Show Tip " + (tips.length - index);
        showTips.appendChild(showTipsSummary);
        const tipElement = document.createElement("p");
        tipElement.style.margin = "5px";
        tipElement.innerHTML = tip;
        showTips.appendChild(tipElement);
        containerRef.insertBefore(showTips, containerRef.children[1]);
    });
}

const createSolutionSectionOnNavbar = () => {
    const ele = document.createElement("li");
    ele.style.cursor = "pointer";
    ele.addEventListener("click", () => {
        document.querySelector(".content").innerHTML = "Solution Page";
        navbarElement.querySelector(".current").classList.remove("current");
        document.getElementById("solution").classList.add("current");
    });
    const a = document.createElement("a");
    a.id = "solution";
    a.innerHTML = "Solution"
    ele.appendChild(a);
    const nav = document.querySelector(".nav");
    nav.appendChild(ele);
}

const loadLanguageSelectorCache = () => {
    const languageSelector = document.getElementById("lang");
    const languageOption = document.getElementById("option");

    chromeStorage.get(["language", "option"]).then((result) => {
        setTimeout(() => {
            if (result.language) languageSelector.value = result.language;
            languageSelector.dispatchEvent(new Event('change'));
            setTimeout(() => {
                if (result.option) languageOption.value = result.option;
                languageSelector.dispatchEvent(new Event('change'));
            }, 300);
        }, 300);
    });
}

const createLanguageSelectorCache = () => {
    const languageSelector = document.getElementById("lang");
    const languageOption = document.getElementById("option");
    languageSelector.addEventListener("change", () => {
        chromeStorage.set({ language: languageSelector.value });
    });
    languageOption.addEventListener("change", () => {
        chromeStorage.set({ option: languageOption.value });
    });
}

const submitCodeFile = (fileData) => {
    const formData = new FormData();
    const languageSelector = document.getElementById("lang");
    const languageOption = document.getElementById("option");
    const csrfToken = document.querySelector("input[name='csrf_token']").value;
    formData.append('csrf_token', csrfToken);
    formData.append('task', problemId);
    formData.append('lang', languageSelector.value);
    if (!languageOption.disabled) formData.append('option', languageOption.value);
    formData.append('target', 'problemset');
    formData.append('type', 'course');
    formData.append('file', fileData, 'code.cpp');
    fetch('/course/send.php', {
        method: 'POST',
        body: formData
    }).then((response) => {
        if (response.ok) {
            location.href = response.url;
        }
    }).catch((error) => {
        console.error('Error:', error);
    });
};

const createCodeInputArea = () => {
    const codeInputArea = document.createElement("textarea");
    codeInputArea.id = "code";
    codeInputArea.style.width = "500px";
    codeInputArea.style.height = "300px";
    const form = document.querySelector("form");
    form.insertBefore(codeInputArea, form.children[5]);
}

const modifySubmitButton = () => {
    const submitButton = document.querySelector("input[type='submit']");
    submitButton.addEventListener("click", (event) => {
        const code = document.getElementById("code").value;
        if (code == "") {
            const fileInput = document.querySelector("input[type='file']");
            submitCodeFile(fileInput.files[0]);
            return;
        }
        submitCodeFile(new Blob([code], { type: 'text/plain' }))
        event.preventDefault();
    });
}

const isSubmitPage = () => location.href.startsWith("https://cses.fi/problemset/submit");

const isProblemPage = () => {
    let result = false;
    const possibleUrls = [
        "https://cses.fi/problemset/submit/",
        "https://cses.fi/problemset/task/",
        "https://cses.fi/problemset/view/",
        "https://cses.fi/problemset/stats/",
        "https://cses.fi/problemset/hack/",
        "https://cses.fi/problemset/result/",
    ];
    possibleUrls.forEach((url) => {
        if (location.href.startsWith(url)) result = true;
    });
    return result;
}

const isProblemListPage = () => [
    "https://cses.fi/problemset/list/",
    "https://cses.fi/problemset/list",
    "https://cses.fi/problemset/",
    "https://cses.fi/problemset"
].includes(location.href);

const createElementByHTMLtext = (htmlText) => {
    const template = document.createElement('template');
    template.innerHTML = htmlText.trim();
    return template.content.firstChild;
}

const generateProblemset = () => {
    const taskGroups = [...document.querySelectorAll(".task-list")];
    taskGroups.shift();
    for (let i = 0; i < taskGroups.length; i++) {
        problemset[topics[i]] = [];
        const problems = [...taskGroups[i].children];
        problems.forEach((problem, index) => {
            const solvers = problem.querySelector(".detail").innerText.split("/").at(0).trim();
            const defaultIndex = index;
            const html = problem.outerHTML;
            problemset[topics[i]].push({
                defaultIndex,
                solvers,
                html
            });
        });
    }
};

const sortByDefault = (topicIndex) => {
    const taskGroups = [...document.querySelectorAll(".task-list")];
    taskGroups.shift();
    taskGroups[topicIndex].innerHTML = "";
    problemset[topics[topicIndex]].sort((a, b) => {
        return a.defaultIndex - b.defaultIndex;
    }).forEach((problem) => {
        taskGroups[topicIndex].innerHTML += problem.html;
    });
}

const sortBySolvers = (topicIndex) => {
    const taskGroups = [...document.querySelectorAll(".task-list")];
    taskGroups.shift();
    taskGroups[topicIndex].innerHTML = "";
    problemset[topics[topicIndex]].sort((a, b) => {
        return b.solvers - a.solvers;
    }).forEach((problem) => {
        taskGroups[topicIndex].innerHTML += problem.html;
    });
}

const createCustomSortSelector = () => {
    const titleList = [...document.querySelectorAll("h2")];
    titleList.shift();
    titleList.forEach((element, index) => {
        const selector = createElementByHTMLtext(`
        <select style="margin-left:0.5rem">
            <option>Sort By Default</option>
            <option>Sort By Number of Solvers</option>
        </select>
        `);
        const sortProblems = () => {
            if (selector.value == "Sort By Default") {
                sortByDefault(index);
            } else if (selector.value == "Sort By Number of Solvers") {
                sortBySolvers(index);
            }
            chromeStorage.get("sort-rule", (result) => {
                const sortRule = result["sort-rule"] ?? {};
                sortRule[index] = selector.value;
                chromeStorage.set({ "sort-rule": sortRule });
            });
        }
        selector.addEventListener("change", () => sortProblems());
        element.appendChild(selector);
        topics.push(element.innerHTML.split("<")[0]);
    });
}

const applySortRule = () => {
    const titleList = [...document.querySelectorAll("h2")];
    chromeStorage.get("sort-rule", (result) => {
        const sortRule = result["sort-rule"] ?? {};
        titleList.shift();
        titleList.forEach((element, index) => {
            const selector = element.querySelector("select");
            if (index in sortRule) {
                selector.value = sortRule[index];
                const event = new Event('change');
                selector.dispatchEvent(event);
            }
        });
    });
}

if (isSubmitPage()) {
    loadLanguageSelectorCache();
    createLanguageSelectorCache();
    createCodeInputArea();
    modifySubmitButton();
}

if (isProblemPage()) {
    createTipsSectionOnSidebar();
    createTagsSectionOnSidebar();
    createSolutionSectionOnNavbar();
}

if (isProblemListPage()) {
    createCustomSortSelector();
    generateProblemset();
    applySortRule();
}
