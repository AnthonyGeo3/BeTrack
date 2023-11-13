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

document.getElementById('exportButton').onclick = function() {
    let csvContent = "data:text/csv;charset=utf-8,";

    // CSV Header
    csvContent += "Start Date,Start Time,End Date,End Time,Duration,Category\n";

    // Loop through logs and add rows
    logs.forEach(log => {
        let start = new Date(log.start).toLocaleString();
        let end = new Date(log.end).toLocaleString();
        let duration = log.duration;
        let category = log.category || "None";
        csvContent += `${start},${end},${duration},${category}\n`;
    });

    // Encoding and Creating Download Link
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "logs.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // Trigger download

    document.body.removeChild(link); // Clean up
};

// Function to update time based on input
document.getElementById('updateTimeButton').onclick = function() {
    // Read value from input field
    let inputMinutes = document.getElementById('inputMinutes').value.trim();

    // Check if the input is a valid number (positive or negative)
    if (/^-?\d+$/.test(inputMinutes)) {
        // Parse the input value as an integer
        let minutesToUpdate = parseInt(inputMinutes, 10);

        // Convert minutes to seconds
        let timeChange = minutesToUpdate * 60;

        // Update elapsedTime with the time change
        elapsedTime += timeChange;

        // Update display and logs
        updateDisplay();
        addLogEntry(timeChange >= 0 ? 'Manual Addition' : 'Manual Subtraction', timeChange);
    } else {
        alert('Please enter a valid whole number for minutes.');
    }

    // Clear the input field after updating
    document.getElementById('inputMinutes').value = '';
};

// Function to subtract manual time
document.getElementById('subtractTimeButton').onclick = function() {
    // Read values from input fields
    let hoursToSubtract = parseInt(document.getElementById('inputHours').value) || 0;
    let minutesToSubtract = parseInt(document.getElementById('inputMinutes').value) || 0;
    let secondsToSubtract = parseInt(document.getElementById('inputSeconds').value) || 0;

    // Convert everything to seconds and subtract from elapsedTime
    let timeToSubtract = (hoursToSubtract * 3600) + (minutesToSubtract * 60) + secondsToSubtract;
    elapsedTime -= timeToSubtract;

    // Update display and logs
    updateDisplay();
    addLogEntry('Manual Subtraction', -timeToSubtract);
};

function increaseTime() {
    elapsedTime++;
    updateDisplay();
}

function decreaseTime() {
    elapsedTime--;
    updateDisplay();
}

// Function to add log entry for manual time updates
function addLogEntry(action, timeChange) {
    let now = new Date();
    logs.push({
        start: now,
        end: now,
        duration: timeChange,
        category: action // 'Manual Addition' or 'Manual Subtraction'
    });

    // Save the log and update the display
    localStorage.setItem('logs', JSON.stringify(logs));
    displayLogs();
}

function updateDisplay() {
    let timeDisplay = document.getElementById('timeDisplay');
    let totalSeconds = elapsedTime;
    
    // Calculate absolute values for hours, minutes, and seconds
    let seconds = Math.abs(totalSeconds) % 60;
    let minutes = Math.floor(Math.abs(totalSeconds) / 60) % 60;
    let hours = Math.floor(Math.abs(totalSeconds) / 3600);

    // Determine the sign of the elapsedTime
    let sign = elapsedTime < 0 ? "-" : "";

    // Build the formatted time string
    let formattedTime = sign +
        (hours > 0 ? hours + " h " : "") +
        ((hours > 0 || minutes > 0) ? minutes + " m " : "") +
        seconds + " s";

    timeDisplay.textContent = 'Time: ' + formattedTime;

    // Update styles and localStorage as in your existing updateDisplay function...
    if (elapsedTime < 0) {
        timeDisplay.style.color = 'red'; // Change font color to red if the time is negative
    } else {
        timeDisplay.style.color = 'white'; // Change it back to white (or any other default color)
    }

    // Save to local storage
    localStorage.setItem('elapsedTime', elapsedTime);
}

function displayLogs() {
    let logContainer = document.getElementById('activityLog');
    logContainer.innerHTML = ''; // Clear existing logs

    logs.forEach((log, index) => {
        let logEntryDiv = document.createElement('div');
        logEntryDiv.className = 'log-entry';

        let logDetailsSpan = document.createElement('span');
        logDetailsSpan.className = 'log-details';
        logDetailsSpan.textContent = `Start: ${new Date(log.start).toLocaleString()}, End: ${new Date(log.end).toLocaleString()}, Duration: ${log.duration} seconds`;

        let categorySpan = document.createElement('span');
        categorySpan.id = `category-${index}`;
        categorySpan.className = 'log-category';
        categorySpan.textContent = log.category ? ` - Category: ${log.category}` : ' - Category: None';

        let categoryButton = document.createElement('button');
        categoryButton.textContent = 'Category';
        // The addCategory function will need to be modified to work with this setup
        categoryButton.onclick = function() { addCategory(index, categorySpan.id); };

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() { removeLog(index); };

        // Append all elements to the log entry div
        logEntryDiv.appendChild(logDetailsSpan);
        logEntryDiv.appendChild(categorySpan);
        logEntryDiv.appendChild(categoryButton);
        logEntryDiv.appendChild(deleteButton);

        // Append this log entry to the log container
        logContainer.appendChild(logEntryDiv);
    });
}


function removeLog(index) {
    logs.splice(index, 1); // Remove the log entry at the given index
    localStorage.setItem('logs', JSON.stringify(logs)); // Update local storage
    displayLogs(); // Refresh the log display
}

function addCategory(index, categorySpanId) {
    let categorySpan = document.getElementById(categorySpanId);
    let currentCategory = logs[index].category || 'None';
    let uniqueCategories = getUniqueCategories();

    let dropdownHTML = `<select id="categorySelect-${index}" onchange="selectCategory(${index}, this.value)">
                            <option value="">Select a category</option>
                            ${uniqueCategories.map(cat => `<option value="${cat}" ${cat === currentCategory ? 'selected' : ''}>${cat}</option>`).join('')}
                            <option value="new">Add New Category</option>
                        </select>`;

    categorySpan.innerHTML = dropdownHTML;
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

function selectCategory(index, selectedValue) {
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