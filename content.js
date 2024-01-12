
chrome.runtime.onConnect.addListener((port) => {
    console.log(`onConnect port: ${JSON.stringify(port)}`)
});

chrome.runtime.onMessage.addListener((message, sender, response) => {
    console.log(`onMessage msg: ${message} sender: ${JSON.stringify(sender)}`);
    response({'response': 'hi'});
});