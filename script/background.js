import {getDomain, retrieveData, storeData} from './utils.js';

let activeTabID = "";
let watcherID = undefined;
const defaultTimeLimit = 30 * 60; // 30 minutes in seconds


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

    // return if not info for this domain found
    if (info === undefined) return

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
    if (info['config'].isLocked) {
        try {
            if (todayHistory.time > 0 && todayHistory.time > info['config'].timeLimit) {
                chrome.tabs.sendMessage(tab.id, { cmd: "timeup" });   
            } else if (todayHistory.open > 0 && todayHistory.open > info['config'].openLimit) {
                chrome.tabs.sendMessage(tab.id, { cmd: "timeup" });
            }
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