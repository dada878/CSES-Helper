const navbarElement = document.querySelector(".nav");
const sidebarElement = document.querySelector(".nav.sidebar");

const createTagsSectionOnSidebar = () => {
    const dividerLine = document.createElement("hr");
    const sectionTitle = document.createElement("h4");
    sectionTitle.innerHTML = "Tags";
    const showTags = document.createElement("details");
    const showTagsSummary = document.createElement("summary");
    const tagsList = ["BIT", "sort", "set"];
    const tagsListElement = document.createElement("p");
    tagsListElement.innerHTML = tagsList.join("  ");
    showTags.appendChild(tagsListElement);
    showTagsSummary.innerHTML = "Show Problem Tags";
    showTags.appendChild(showTagsSummary);
    sidebarElement.insertBefore(dividerLine, sidebarElement.firstChild);
    sidebarElement.insertBefore(showTags, sidebarElement.firstChild);
    sidebarElement.insertBefore(sectionTitle, sidebarElement.firstChild);
}

createTagsSectionOnSidebar();

fetch("https://github.com/official-scint/official-scint.github.io/blob/master/config.json");