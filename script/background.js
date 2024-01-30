let activeTabID = "";
let tabInfo = {};

const defaultTimeLimit = 30 * 60; // 30 minutes in seconds

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

let watcherID = null;
async function runWatcher() {
    const domain = tabInfo[activeTabID] ??= ""

    if (domain != "") {
        // key for today data
        const today = new Date().toLocaleDateString();

        // get data of the domain
        let info = await retrieveData([domain]);
        info = info[domain];

        // crete new object if no previous data exists
        if (info === undefined) {
            info = {};
            info['config'] = {
                timeLimit: defaultTimeLimit
            }
            info['history'] = {};
        }

        // get data for today
        let history = info['history'];
        console.log(JSON.stringify(info));
        let todayHistory = history[today];
        if (todayHistory === undefined) {
            todayHistory = { time: 0 };
        }

        // update time
        todayHistory.time = todayHistory.time + 1;

        // update today history
        history[today] = todayHistory;
        info['history'] = history;

        // put the history back
        const toPut = { [domain]: info };
        await storeData(toPut);

        if (todayHistory.time > info['config'].timeLimit) {
            const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            if (tab !== undefined) {
                chrome.tabs.sendMessage(tab.id, { cmd: "timeup" });
            }
        }
    }
}

setInterval(() => runWatcher(), 1000);

chrome.runtime.onInstalled.addListener(() => {
    console.log("onInstalled: service stated");
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        if(tabs[0].url || tabs[0].url !== undefined) {
            activeTabID = tabs[0].id;
            tabInfo[activeTabID] = getDomain(tabs[0].url);
        }
    });
});

// chrome.runtime.onStartup.addListener(() => {
//     console.log("onStartup: service stated");

//     try {
//         clearTimeout(timerID);
//     } catch (error) {

//     }
//     const timerID = setInterval(() => runWatcher(), 1000);
// });

chrome.tabs.onActivated.addListener((activeInfo) => {
    activeTabID = activeInfo.tabId;
    console.log(`onActivated: Tab ${activeTabID} activated`);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        const domain = getDomain(tab.url);
        console.log(`onUpdated: ${domain} ${JSON.stringify(changeInfo)}`);
        tabInfo[tabId] = domain;
    }
});