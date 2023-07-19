fetch("https://github.com/official-scint/official-scint.github.io/blob/master/config.json").then(response => response.json()).then(data => {
    const content = data.payload.blob.rawLines.join("\n");
    console.log(JSON.parse(content));
});