import {retrieveLocalStorageItems, storeData} from './utils.js';

// ---------------------------- script ------------------------------------- //

async function updateDomainSettings(domain, item) {
  // history is lost since background.js is updating the data each second
  // but the item passes in parameter is old one.
  const dataItems = await retrieveLocalStorageItems();
  const [_, newItem] = Object.entries(dataItems).find(([k, _]) => k == domain);
  newItem["config"] = item.config;

  console.log(`update: domain: ${domain} data: ${JSON.stringify(newItem)}`);

  storeData({ [domain]: newItem });
  loadDomainSettings(dataItems, domain);
}

function loadDomainSettings(dataItems, domain) {
  const [_, item] = Object.entries(dataItems).find(([k, _]) => k == domain);
  console.log(`dataItem: ${JSON.stringify(item)}`);

  const timeLimit = item["config"]["timeLimit"];
  const openLimit = item["config"]["openLimit"];
  const pauseHistory = item["config"]["pauseHistory"];
  const pauseTimeout = item["config"]["pauseTimeout"];

  document.getElementById("p-time").textContent = `${timeLimit / 60}m`;
  document.getElementById("p-open").textContent = `${openLimit}`;

  const sRecordHistory = document.getElementById("s-pause-history");
  sRecordHistory.checked = pauseHistory;
  sRecordHistory.onchange = () => {
    item["config"].pauseHistory = sRecordHistory.checked;

    updateDomainSettings(domain, item);
  };

  const sRedirect = document.getElementById("s-dont-redirect");
  sRedirect.checked = pauseTimeout;
  sRedirect.onchange = () => {
    if (domain != "others") {
      item["config"].pauseTimeout = sRedirect.checked;
    }

    updateDomainSettings(domain, item);
  };

  document.getElementById("b-time-dec").onclick = async () => {
    let time = timeLimit - 60;
    if (time < 0) time = 0;
    item["config"].timeLimit = time;

    updateDomainSettings(domain, item);
  };

  document.getElementById("b-time-inc").onclick = async () => {
    let time = timeLimit + 60;
    item["config"].timeLimit = time;

    updateDomainSettings(domain, item);
  };

  document.getElementById("b-open-dec").onclick = async () => {
    let open = openLimit - 1;
    if (open < 0) open = 0;
    item["config"].openLimit = open;

    updateDomainSettings(domain, item);
  };

  document.getElementById("b-open-inc").onclick = async () => {
    let open = openLimit + 1;
    item["config"].openLimit = open;

    updateDomainSettings(domain, item);
  };
}

function createListItems(dataItems, selectedDomain) {
  console.log(JSON.stringify(dataItems));
  const ul = document.getElementById("site-lists");

  // clear the list
  while(ul.firstChild) {
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
      loadDomainSettings(dataItems, domain);
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
