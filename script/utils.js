// Function to retrieve data from local storage
export function retrieveLocalStorageItems() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, function (result) {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(result);
      }
    });
  });
}

export function retrieveData(keysToRetrieve) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keysToRetrieve, function (result) {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(result);
      }
    });
  });
}

export function storeData(dataToStore) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(dataToStore, function () {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve("Data stored successfully");
      }
    });
  });
}

export async function increaseTimeLimit(domain) {
  let info = await retrieveData([domain]);
  info = info[domain];

  if (info) {
    const current = info['config'].timeLimit;
    await updateConfig(domain, 'timeLimit', current + 60);
  }
}

export async function decreaseTimeLimit(domain) {
  let info = await retrieveData([domain]);
  info = info[domain];

  if (info) {
    const current = info['config'].timeLimit;
    if (current == 0) return;
    await updateConfig(domain, 'timeLimit', current - 60);
  }
}

export async function increaseOpenLimit(domain) {
  let info = await retrieveData([domain]);
  info = info[domain];

  if (info) {
    const current = info['config'].openLimit;
    await updateConfig(domain, 'openLimit', current + 1);
  }
}

export async function decreaseOpenLimit(domain) {
  let info = await retrieveData([domain]);
  info = info[domain];

  if (info) {
    const current = info['config'].openLimit;
    if (current == 0) return;
    
    await updateConfig(domain, 'openLimit', current - 1);
  }
}

export async function startTracking(domain) {
  await updateConfig(domain, 'pauseHistory', false);
}

export async function stopTracking(domain) {
  if (domain != "others") {
    await updateConfig(domain, 'pauseHistory', true);
  }
}

export async function lockSite(domain) {
  if (domain != "others") {
    await updateConfig(domain, 'isLocked', true);
  } 
}

export async function unlockSite(domain) {
  await updateConfig(domain, 'isLocked', false);
}

async function updateConfig(domain, field, value) {
  let info = await retrieveData([domain]);
  info = info[domain];

  if (info === undefined) {
    info = {};

    info["config"] = {
      timeLimit: 30 * 60, // 30 min,
      openLimit: 15,
      isLocked: domain == "others" ? false : true,
      pauseHistory: false,
    };

    info["history"] = {};
  }

  if (field != undefined && value != undefined) {
    info["config"][field] = value;
  }

  await storeData({ [domain]: info });
}

// Function to format seconds to "h:m:s" format
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = "";
  if (hours > 0) {
    formattedTime += hours + "h ";
  }
  if (minutes > 0 || hours > 0) {
    formattedTime += minutes + "m ";
  }
  formattedTime += remainingSeconds + "s";

  return formattedTime.trim();
}

export async function getActiveDomain() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (tab === undefined) return;
  const url = tab.url;
  if (!url || url === undefined) return;

  return getDomain(url);
}

export function getDomain(url) {
  try {
    // Create a URL object from the provided URL string
    const urlObject = new URL(url);
    if (urlObject.protocol != "http:" && urlObject.protocol != "https:") {
      console.log(
        `protocol: ${urlObject.protocol} ${
          urlObject.protocol == "https:"
        } ${url}`
      );
      return "others";
    }

    // Access the hostname property to get the domain
    const domain = urlObject.hostname;

    return domain;
  } catch (error) {
    console.error("Invalid URL:", error);
    return "";
  }
}
