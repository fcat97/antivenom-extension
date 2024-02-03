let activeTabID = "";
let watcherID = undefined;
const defaultTimeLimit = 30 * 60; // 30 minutes in seconds

function getDomain(url) {
    try {
        // Create a URL object from the provided URL string
        const urlObject = new URL(url);
        if (urlObject.protocol != "http:" && urlObject.protocol != "https:") {
            console.log(`protocol: ${urlObject.protocol} ${urlObject.protocol == "https:"} ${url}`);
            return "others";
        }

        // Access the hostname property to get the domain
        const domain = urlObject.hostname;

        return domain;
    } catch (error) {
        console.error('Invalid URL:', error);
        return 'www';
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


async function runWatcher() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab === undefined) return;
    const url = tab.url;
    if(!url || url === undefined) return;

    const domain = getDomain(url);
    if (domain == "") return;


    // key for today data
    const today = new Date().toLocaleDateString();

    // get data of the domain
    let info = await retrieveData([domain]);
    info = info[domain];

    // crete new object if no previous data exists
    if (info === undefined) {
        info = {};
        info['config'] = {
            timeLimit: defaultTimeLimit,
            openLimit: 0,
            pauseTimeout: false,
            pauseHistory: false
        }

        info['history'] = {};
        
        if (domain == 'others') {
            info['config'].pauseTimeout = true;
        }
    }

    // get data for today
    let history = info['history'];
    let todayHistory = history[today];
    if (todayHistory === undefined) {
        todayHistory = { time: 0, open: 0 };
    }

    if (!info['config'].pauseHistory) {
        // update time
        todayHistory.time = todayHistory.time + 1;

        if (activeTabID != tab.id) {
            todayHistory.open = todayHistory.open + 1;
            activeTabID = tab.id;
        }
    }

    // update today history
    history[today] = todayHistory;
    info['history'] = history;

    console.log(JSON.stringify(info));

    // put the history back
    const toPut = { [domain]: info };
    await storeData(toPut);

    // send timeout signal
    if (!info['config'].pauseTimeout && todayHistory.time > info['config'].timeLimit) {
        try {
            chrome.tabs.sendMessage(tab.id, { cmd: "timeup" });   
        } catch (error) {
            console.log(error);
        }
    }
}

function startJob() {
    console.log(`startJob called`);
    if(watcherID) {
        clearInterval(watcherID);
        console.log(`old watcher killed ${watcherID}`);
    }

    watcherID = setInterval(() => runWatcher(), 1000);
    console.log(`new watcher started ${watcherID}`);
}

startJob();

chrome.runtime.onInstalled.addListener(() => {
    console.log("onInstalled: service installed");
    startJob();
});

chrome.runtime.onStartup.addListener(() => {
    console.log("onStartup: service started");
    startJob();
});

chrome.runtime.onConnect.addListener(() => {
    console.log("onConnect: service connected");
    startJob();
});