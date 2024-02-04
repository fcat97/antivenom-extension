// popup.js

import {
  retrieveLocalStorageItems,
  formatTime,
  getActiveDomain,
  addToTrackingList,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async function () {
  const activeDomain = await getActiveDomain();

  // Function to dynamically create sorted list items
  function createSortedListItems(data) {
    const listContainer = document.querySelector(".list-group");
    listContainer.innerHTML = "";

    // Sort keys in descending order based on their values
    const today = new Date().toLocaleDateString();
    const filtered = Object.keys(data).filter((e) =>
      data[e]["history"].hasOwnProperty([today])
    );
    const sortedKeys = filtered.sort(
      (a, b) => data[b]["history"][today].time - data[a]["history"][today].time
    );

    if (!Object.keys(data).includes(activeDomain)) {
      const li = getAddToTrackingElement(activeDomain);
      listContainer.appendChild(li);

      document.getElementById("b-lock-site").onclick = async () => {
        console.log(`add btn: ${activeDomain}`);
        await addToTrackingList(activeDomain);
      };
    }

    for (const key of sortedKeys) {
      const hostname = key;
      const time = data[key]["history"][today]["time"];
      const isActive = activeDomain == key;
      const isLocked = data[key]['config'].isLocked;
      const li = getListElement(hostname, time, isActive, isLocked);
      listContainer.appendChild(li);
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
function getListElement(hostname, esplaced, isActive, isLocked) {
  const timeElapsed = formatTime(esplaced);
  const itemId = `${hostname}`;

  let hostnameDiv;
  if (isLocked) {
    hostnameDiv = `
      <div class="col-8" style="text-overflow: ellipsis; text-wrap: nowrap; overflow: hidden;">
        <i class="bi bi-lock"></i>${hostname}
      </div>
    `
  } else {
    hostnameDiv = `
      <div class="col-8" style="text-overflow: ellipsis; text-wrap: nowrap; overflow: hidden;">
        ${hostname}
      </div>
    `
  }

  let template = `
  <div class="row justify-content-between">
    ${hostnameDiv}
    <div class="col-4" style="text-align: end;">
      ${timeElapsed}
    </div>
  </div>
  `;

  const li = document.createElement("li");
  li.classList.add("list-group-item");
  li.id = `li-${itemId}`;

  if (isActive) {
    li.classList.add("active-tab");
  }

  li.innerHTML = template;
  return li;
}

function getAddToTrackingElement(hostname) {
  const li = document.createElement("li");
  li.classList.add("tag-group-item");
  li.id = `li-${hostname}-add`;

  li.innerHTML = `
  <div class="row justify-content-between m-1">
    <div class="col-8" style="text-overflow: ellipsis; text-wrap: nowrap; overflow: hidden;">
      ${hostname}
    </div>
    <div class="col-4" style="text-align: end;">
      <button type="button" class="btn btn-sm btn-outline-primary" id="b-lock-site">
        <i class="bi bi-lock"></i>
      </button>
    </div>
  </div>
  `;

  return li;
}
