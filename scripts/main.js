if (typeof browser === "undefined") var browser = chrome;

const splittedUrl = window.location.href.split("/");
const problemId = splittedUrl.at(-1) == "" ? splittedUrl.at(-2) : splittedUrl.at(-1);
const navbarElement = document.querySelector(".nav");
const sidebarElement = document.querySelector(".nav.sidebar");

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

const createTagsSectionOnSidebar = async () => {
    const dividerLine = document.createElement("hr");
    const sectionTitle = document.createElement("h4");
    sectionTitle.innerHTML = "Tags";
    const showTags = document.createElement("details");
    const showTagsSummary = document.createElement("summary");
    const tagsListElement = document.createElement("ul");
    tagsListElement.id = "tags"
    tagsListElement.style.marginTop = "5px";
    showTags.appendChild(tagsListElement);
    showTagsSummary.innerHTML = "Show Problem Tags";
    showTags.appendChild(showTagsSummary);
    sidebarElement.insertBefore(dividerLine, sidebarElement.firstChild);
    sidebarElement.insertBefore(showTags, sidebarElement.firstChild);
    sidebarElement.insertBefore(sectionTitle, sidebarElement.firstChild);
    const tagsList = await getTags(problemId);
    tagsList.forEach((tag) => {
        const tagElement = document.createElement("li");
        tagElement.innerHTML = tag;
        document.getElementById("tags").appendChild(tagElement);
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
    const language = localStorage.getItem("language");
    const option = localStorage.getItem("language_option");
    if (language) languageSelector.value = language;
    setTimeout(() => {
        const event = new Event('change');
        languageSelector.dispatchEvent(event);
        if (option) languageOption.value = option;
    }, 500);
}

const createLanguageSelectorCache = () => {
    const languageSelector = document.getElementById("lang");
    const languageOption = document.getElementById("option");
    languageSelector.addEventListener("onselect", () => {
        localStorage.setItem("language", languageSelector.value);
        console.log("language changed to " + languageSelector.value);
    });
    languageOption.addEventListener("onselect", () => {
        localStorage.setItem("language_option", languageOption.value);
        console.log("language changed to " + languageOption.value);
    });
}

const submitCode = (code) => {
    const fileData = new Blob([code], { type: 'text/plain' });
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
    console.log(formData);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/course/send.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                location.href = xhr.responseURL;
            } else {
                alert("submit failed");
            }
        }
    };
    xhr.send(formData);
}

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
            alert("code is empty");
            return;
        }
        submitCode(code);
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

if (isSubmitPage()) {
    loadLanguageSelectorCache();
    createLanguageSelectorCache();
    createCodeInputArea();
    modifySubmitButton();
}

if (isProblemPage()) {
    createTagsSectionOnSidebar();
    createSolutionSectionOnNavbar();
}