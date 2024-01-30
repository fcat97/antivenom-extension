// popup.js

document.addEventListener('DOMContentLoaded', function () {
  // Function to retrieve data from local storage
  function retrieveLocalStorageItems() {
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

  // Function to dynamically create sorted list items
  function createSortedListItems(data) {
    const listContainer = document.querySelector('.list-group');
    listContainer.innerHTML = '';

    // Sort keys in descending order based on their values
    const today = new Date().toLocaleDateString();
    const filtered = Object.keys(data).filter(e => data[e]['history'].hasOwnProperty([today]));
    const sortedKeys = filtered.sort((a, b) => data[b]['history'][today].time - data[a]['history'][today].time);

    for (const key of sortedKeys) {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'text-truncate');

      const keySpan = document.createElement('span');
      keySpan.textContent = key;

      const valueSpan = document.createElement('span');
      valueSpan.textContent = formatTime(data[key]['history'][today]['time']);

      listItem.appendChild(keySpan);
      listItem.appendChild(valueSpan);
      listContainer.appendChild(listItem);
    }

    // set today's usages
    let totalToday = 0;
    filtered.forEach(e => { totalToday += data[e]['history'][today].time });
    
    const todayDate = document.querySelector('.date-today');
    todayDate.innerHTML = '';
    const textSpan = document.createElement('p');
    const dateFormat = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    textSpan.innerHTML = `${new Date().toLocaleDateString('en-gb', dateFormat)} | ${formatTime(totalToday)}`;
    todayDate.appendChild(textSpan);
  }

  // Function to format seconds to "h:m:s" format
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let formattedTime = '';
    if (hours > 0) {
      formattedTime += hours + 'h ';
    }
    if (minutes > 0 || hours > 0) {
      formattedTime += minutes + 'm ';
    }
    formattedTime += remainingSeconds + 's';

    return formattedTime.trim();
  }

  // Main logic to retrieve and display sorted local storage items
  async function main() {
    try {
      const localStorageData = await retrieveLocalStorageItems();
      createSortedListItems(localStorageData);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Call the main function when the DOM is loaded
  setInterval(() => main(), 1000);
});
