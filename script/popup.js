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

  // Function to dynamically create list items
  function createListItems(data) {
    const listContainer = document.querySelector('.list-group');

    for (const key in data) {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

      const keySpan = document.createElement('span');
      keySpan.textContent = key;

      const valueSpan = document.createElement('span');
      valueSpan.textContent = formatTime(data[key]);

      listItem.appendChild(keySpan);
      listItem.appendChild(valueSpan);
      listContainer.appendChild(listItem);
    }
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

  // Main logic to retrieve and display local storage items
  async function main() {
    try {
      const localStorageData = await retrieveLocalStorageItems();
      createListItems(localStorageData);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Call the main function when the DOM is loaded
  main();
});
