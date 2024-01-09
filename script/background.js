let activeTabID = "";
let tabInfo = {};

const timeLimit = 30 * 60 * 1000; // 30 minutes in milliseconds

function getDomain(url) {
    try {
        // Create a URL object from the provided URL string
        const urlObject = new URL(url);

        // Access the hostname property to get the domain
        const domain = urlObject.hostname;

        return domain;
    } catch (error) {
        console.error('Invalid URL:', error);
        return '';
    }
}

// Function to store data
function storeData(dataToStore) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(dataToStore, function () {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve('Data stored successfully');
            }
        });
    });
};

// Function to retrieve data
function retrieveData(keysToRetrieve) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keysToRetrieve, function (result) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(result);
            }
        });
    });
};


chrome.tabs.onActivated.addListener((activeInfo) => {
    activeTabID = activeInfo.tabId;
    console.log(`onActivated: Tab ${activeTabID} activated`);
});


chrome.runtime.onInstalled.addListener(() => {
    console.log("onInstalled: service stated");

    const watcher = async () => {
        const domain = tabInfo[activeTabID] ??= ""

        if (domain != "") {
            const keysToRetrieve = [domain]
 
            const history = await retrieveData(keysToRetrieve);
            let time = history[domain] ??= 0;
 
            const toPut = { [domain]: time + 1 };
            await storeData(toPut);

            console.log(`history: url:${domain} t:${time}s time:${new Date().getTime().toLocaleString()}`);
        }

        const d = new Date();
        // console.log(`${d.getTime().toLocaleString()}`);
    };

    const timerID = setInterval(() => watcher(), 1000);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        const domain = getDomain(tab.url);
        console.log(`onUpdated: ${domain} ${JSON.stringify(changeInfo)}`);
        tabInfo[tabId] = domain;
    }
});