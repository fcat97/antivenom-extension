// popup.js

import {
  retrieveLocalStorageItems,
  formatTime,
  getActiveDomain,
  startTracking,
  stopTracking,
  lockSite,
  unlockSite
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async function () {
  const activeDomain = await getActiveDomain();

  // Function to dynamically create sorted list items
  function createSortedListItems(data) {
 
    // Sort keys in descending order based on their values
    const today = new Date().toLocaleDateString();
    const filtered = Object.keys(data).filter((e) =>
      data[e]["history"].hasOwnProperty([today])
    );

    if (!Object.keys(data).includes(activeDomain)) {
      const time = 0;
      const opened = 0;
      const remainingTime = 0;
      const remainingOpen = 0;
      const isLocked = false;
      const pauseHistory = false;

      updateDomailData(activeDomain, isLocked, pauseHistory, time, opened, remainingTime, remainingOpen)
    } else {
      const hostInfo = data[activeDomain];
      const time = hostInfo["history"][today].time;
      const opened = hostInfo["history"][today].open;
      const remainingTime = hostInfo['config'].timeLimit - time;
      const remainingOpen = hostInfo['config'].openLimit - opened;
      const isLocked = hostInfo['config'].isLocked;
      const pauseHistory = hostInfo['config'].pauseHistory;

      updateDomailData(activeDomain, isLocked, pauseHistory, time, opened, remainingTime, remainingOpen)
    }

    // set today's usages
    let totalToday = 0;
    filtered.forEach((e) => {
      totalToday += data[e]["history"][today].time;
    });

    const todayDate = document.querySelector("#date-today");
    const dateFormat = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    todayDate.innerHTML = `<strong>${new Date().toLocaleDateString(
      "en-gb",
      dateFormat
    )}</strong>`;

    const todayTime = document.querySelector(".total-today");
    todayTime.innerHTML = `${formatTime(totalToday)}`;
  }

  document.getElementById("btn-settings").onclick = () => {
    window.open("../options.html");
  };

  // Main logic to retrieve and display sorted local storage items
  async function main() {
    try {
      const localStorageData = await retrieveLocalStorageItems();
      createSortedListItems(localStorageData);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  main();
  
  // Call the main function when the DOM is loaded
  setInterval(() => main(), 1000);
});

// -------------------------------- template ---------------------------------------- //
function updateDomailData(domain, isLocked, pauseHistory, spentTime, opened, remainingTime, remainingOpen) {
  document.getElementById('domain-name').innerHTML = `<strong>${domain}</strong>`;

  if (isLocked) {
    document.getElementById('span-remaining').innerText = "Remaining:";
    document.getElementById('i-time').innerText = formatTime(remainingTime);
    document.getElementById('i-open').innerText = remainingOpen;

    document.getElementById('b-unlock-site').style.display = 'block';
    document.getElementById('b-lock-site').style.display = 'none';
  } else {
    document.getElementById('span-remaining').innerText = "Spent:";
    document.getElementById('i-time').innerText = formatTime(spentTime);
    document.getElementById('i-open').innerText = opened;

    document.getElementById('b-unlock-site').style.display = 'none';
    document.getElementById('b-lock-site').style.display = 'block';
  }
  
  if (pauseHistory) {
    document.getElementById('div-stat').style.display = 'none';

    document.getElementById('b-tracking-pause').style.display = 'none';
    document.getElementById('b-tracking-start').style.display = 'block';
  } else {
    document.getElementById('div-stat').style.display = 'block';

    document.getElementById('b-tracking-pause').style.display = 'block';
    document.getElementById('b-tracking-start').style.display = 'none';
  }

  document.getElementById('b-tracking-start').onclick = async () => {
    await startTracking(domain);
  };
  document.getElementById('b-tracking-pause').onclick = async () => {
    await stopTracking(domain);
  };
  document.getElementById('b-lock-site').onclick = async () => {
    await lockSite(domain);
  };
  document.getElementById('b-unlock-site').onclick = async () => {
    await unlockSite(domain);
  };
}
