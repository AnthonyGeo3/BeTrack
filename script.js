let increaseTimer = null;
let decreaseTimer = null;
let elapsedTime = 0;
let startTime = null;
let logs = [];
let sessionType = null; // 'increase' or 'decrease'

// Start increasing time
document.getElementById('startButton').onclick = function() {
    if (increaseTimer === null) {
        if (decreaseTimer === null && increaseTimer === null) {
            startTime = new Date();
            sessionType = 'increase'; // Set session type
        }
        if (decreaseTimer !== null) {
            clearInterval(decreaseTimer);
            decreaseTimer = null;
        }
        increaseTimer = setInterval(increaseTime, 1000);
    }
};

// Start decreasing time
document.getElementById('reduceButton').onclick = function() {
    if (decreaseTimer === null) {
        if (decreaseTimer === null && increaseTimer === null) {
            startTime = new Date();
            sessionType = 'decrease'; // Set session type
        }
        if (increaseTimer !== null) {
            clearInterval(increaseTimer);
            increaseTimer = null;
        }
        decreaseTimer = setInterval(decreaseTime, 1000);
    }
};

// Stop both timers and log with positive or negative duration
document.getElementById('stopButton').onclick = function() {
    let endTime = new Date(); 
    let sessionDuration = Math.floor((endTime - startTime) / 1000);

    if (sessionType === 'decrease') {
        sessionDuration = -sessionDuration; // Make duration negative for decrease sessions
    }

    logs.push({
        start: startTime,
        end: endTime,
        duration: sessionDuration
    });

    clearInterval(increaseTimer);
    clearInterval(decreaseTimer);
    increaseTimer = null;
    decreaseTimer = null;
    startTime = null; // Reset startTime for the next session

    localStorage.setItem('logs', JSON.stringify(logs)); // Save logs to local storage
    sessionType = null; // Reset session type
};

// Show Logs
document.getElementById('viewLogButton').onclick = function() {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('logPage').style.display = 'block';
    displayLogs();
};

// Show Home
document.getElementById('homeButton').onclick = function() {
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('logPage').style.display = 'none';
};

function increaseTime() {
    elapsedTime++;
    updateDisplay();
}

function decreaseTime() {
    elapsedTime--;
    updateDisplay();
}

function updateDisplay() {
    let timeDisplay = document.getElementById('timeDisplay');
    localStorage.setItem('elapsedTime', elapsedTime);
    timeDisplay.textContent = 'Time: ' + elapsedTime;

    if (elapsedTime < 0) {
        timeDisplay.style.color = 'red'; // Change font color to red
    } else {
        timeDisplay.style.color = 'white'; // Change it back to white (or any other default color)
    }
}

function displayLogs() {
    let logContainer = document.getElementById('activityLog');
    logContainer.innerHTML = ''; // Clear existing logs

    logs.forEach((log, index) => {
        let start = new Date(log.start);
        let end = new Date(log.end);

        let logElement = document.createElement('div');
        let categoryButton = document.createElement('button');
        categoryButton.textContent = 'Category';
        categoryButton.onclick = function() { addCategory(index); };

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() { removeLog(index); };

        let categoryDisplay = document.createElement('span');
        categoryDisplay.textContent = log.category ? ` - Category: ${log.category}` : ' - Category: None';
        categoryDisplay.id = `category-${index}`;

        logElement.textContent = `Start: ${start.toLocaleString()}, End: ${end.toLocaleString()}, Duration: ${log.duration} seconds`;
        logElement.appendChild(categoryButton);
        logElement.appendChild(categoryDisplay);
        logElement.appendChild(deleteButton);
        logContainer.appendChild(logElement);
    });
}


function removeLog(index) {
    logs.splice(index, 1); // Remove the log entry at the given index
    localStorage.setItem('logs', JSON.stringify(logs)); // Update local storage
    displayLogs(); // Refresh the log display
}

function addCategory(index) {
    let currentCategory = logs[index].category || 'None';
    let uniqueCategories = getUniqueCategories();
    let dropdownHTML = `<select id="categorySelect-${index}" onchange="selectCategory(${index})">
                            <option value="${currentCategory}">${currentCategory}</option>
                            ${uniqueCategories.map(cat => cat !== currentCategory ? `<option value="${cat}">${cat}</option>` : '').join('')}
                            <option value="new">-- Add New --</option>
                        </select>`;
    
    let categoryDisplay = document.getElementById(`category-${index}`);
    categoryDisplay.innerHTML = dropdownHTML;
}

function getUniqueCategories() {
    let uniqueCategories = new Set();
    logs.forEach(log => {
        if (log.category) {
            uniqueCategories.add(log.category);
        }
    });
    return Array.from(uniqueCategories);
}

function selectCategory(index) {
    let selectedValue = document.getElementById(`categorySelect-${index}`).value;
    
    if (selectedValue === 'new') {
        let newCategory = prompt("Enter a new category:");
        if (newCategory) {
            logs[index].category = newCategory;
        }
    } else {
        logs[index].category = selectedValue;
    }

    localStorage.setItem('logs', JSON.stringify(logs));
    displayLogs(); // Refresh the log display
}


window.onload = function() {
    if (localStorage.getItem('elapsedTime')) {
        elapsedTime = parseInt(localStorage.getItem('elapsedTime'));
        updateDisplay();
    }

    if (localStorage.getItem('logs')) {
        logs = JSON.parse(localStorage.getItem('logs')); // Retrieve and parse logs
    }
};