// popup.js

import {retrieveLocalStorageItems, formatTime, getActiveDomain} from './utils.js';


document.addEventListener('DOMContentLoaded', async function () {
  const activeDomain = await getActiveDomain();

  // Function to dynamically create sorted list items
  function createSortedListItems(data) {
    const listContainer = document.querySelector('.list-group');
    listContainer.innerHTML = '';

    // Sort keys in descending order based on their values
    const today = new Date().toLocaleDateString();
    const filtered = Object.keys(data).filter(e => data[e]['history'].hasOwnProperty([today]));
    const sortedKeys = filtered.sort((a, b) => data[b]['history'][today].time - data[a]['history'][today].time);

    for (const key of sortedKeys) {
      const hostname = key;
      const time = data[key]['history'][today]['time'];
      const isActive = activeDomain == key;
      const li = getListElement(hostname, time, isActive);
      listContainer.appendChild(li);
    }

    // set today's usages
    let totalToday = 0;
    filtered.forEach(e => { totalToday += data[e]['history'][today].time });

    const todayDate = document.querySelector('#date-today');
    const dateFormat = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    todayDate.innerHTML = `${new Date().toLocaleDateString('en-gb', dateFormat)}`;

    const todayTime = document.querySelector(".total-today");
    todayTime.innerHTML = `${formatTime(totalToday)}`;
  }

  function getListElement(hostname, esplaced, isActive) {
    const timeElapsed = formatTime(esplaced);
    const itemId = `${hostname}`

    let template = `
    <div class="row justify-content-between">
      <div class="col-8" style="text-overflow: ellipsis; text-wrap: nowrap; overflow: hidden;">
        ${hostname}
      </div>
      <div class="col-4" style="text-align: end;">
        ${timeElapsed}
      </div>
    </div>
    `

    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.id = `li-${itemId}`;

    if (isActive) {
      li.classList.add("active-tab");
    }

    li.innerHTML = template;
    return li;
  }


  document.getElementById('btn-settings').onclick =  () => {
    window.open('../options.html');
  };

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
