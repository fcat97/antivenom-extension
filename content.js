
chrome.runtime.onConnect.addListener((port) => {
    console.log(`onConnect port: ${JSON.stringify(port)}`)
});

chrome.runtime.onMessage.addListener((message, sender, response) => {
    if(message['cmd'] == "timeup") {
        console.log("timeup");
        window.location.href = chrome.runtime.getURL("timeout2.html");
    }
});