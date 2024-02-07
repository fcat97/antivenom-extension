import {
  retrieveLocalStorageItems,
  increaseTimeLimit,
  decreaseTimeLimit,
  increaseOpenLimit,
  decreaseOpenLimit,
  lockSite,
  unlockSite,
  startTracking,
  stopTracking,
  retrieveData,
} from "./utils.js";

// ---------------------------- script ------------------------------------- //

async function loadDomainSettings(domain) {
  let item = await retrieveData([domain]);
  item = item[domain];
  console.log(`dataItem: ${JSON.stringify(item)}`);

  const timeLimit = item["config"]["timeLimit"];
  const openLimit = item["config"]["openLimit"];
  const pauseHistory = item["config"]["pauseHistory"];
  const isLocked = item["config"]["isLocked"];

  document.getElementById("p-time").textContent = `${timeLimit / 60}m`;
  document.getElementById("p-open").textContent = `${openLimit}`;

  const sRecordHistory = document.getElementById("s-pause-history");
  sRecordHistory.checked = pauseHistory;
  sRecordHistory.onchange = async () => {
    if (sRecordHistory.checked) {
      await stopTracking(domain);
    } else {
      await startTracking(domain);
    }

    await loadDomainSettings(domain);
  };

  const sRedirect = document.getElementById("s-dont-redirect");
  sRedirect.checked = isLocked;
  sRedirect.onchange = async () => {
    if (sRedirect.checked) {
      await lockSite(domain);
    } else {
      await unlockSite(domain);
    }
    await loadDomainSettings(domain);
  };

  document.getElementById("b-time-dec").onclick = async () => {
    await decreaseTimeLimit(domain);
    await loadDomainSettings(domain);
  };
  document.getElementById("b-time-inc").onclick = async () => {
    await increaseTimeLimit(domain);
    await loadDomainSettings(domain);
  };
  document.getElementById("b-open-dec").onclick = async () => {
    await decreaseOpenLimit(domain);
    await loadDomainSettings(domain);
  };
  document.getElementById("b-open-inc").onclick = async () => {
    await increaseOpenLimit(domain);
    await loadDomainSettings(domain);
  };
}

function createListItems(dataItems, selectedDomain) {
  console.log(JSON.stringify(dataItems));
  const ul = document.getElementById("site-lists");

  // clear the list
  while (ul.firstChild) {
    ul.removeChild(ul.lastChild);
  }

  Object.keys(dataItems).forEach((domain) => {
    console.log(`domain: ${domain}`);
    const li = getListItemTemplate(domain, domain == selectedDomain);
    ul.appendChild(li);

    li.onclick = () => {
      document.getElementById("div-settings").style.display = "block";
      document.getElementById("div-none-selected").style.display = "none";

      createListItems(dataItems, domain);
      loadDomainSettings(domain);
    };
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("settings dom created");
  const dataItems = await retrieveLocalStorageItems();
  createListItems(dataItems);

  document.getElementById("div-settings").style.display = "none";
  document.getElementById("div-none-selected").style.display = "block";
});

// ------------------------------- template -----------------------------------------

function getListItemTemplate(domain, isSelected) {
  const li = document.createElement("li");
  li.classList.add("list-group-item");
  li.id = `li-${domain}`;
  li.innerHTML = `
  <div class="p-2" style="text-overflow: ellipsis; text-wrap: nowrap; overflow: hidden;">
    <a href="#${domain}" style="text-decoration: none; color: unset;">${domain}</a>
  </div>
  `;

  if (isSelected) {
    li.classList.add("selected-domain");
  }

  return li;
}
