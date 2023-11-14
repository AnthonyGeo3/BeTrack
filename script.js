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

document.getElementById('stopButton').onclick = function() {
    // Only proceed if a timer was running
    if (increaseTimer !== null || decreaseTimer !== null) {
        let endTime = new Date(); 
        let sessionDuration = Math.floor((endTime - startTime) / 1000);

        // Determine if we are logging an increase or decrease session
        if (sessionType === 'increase') {
            sessionDuration = Math.abs(sessionDuration); // Ensure it's positive
        } else if (sessionType === 'decrease') {
            sessionDuration = -Math.abs(sessionDuration); // Ensure it's negative
        }

        logs.push({
            start: startTime,
            end: endTime,
            duration: sessionDuration
        });

        // Clear both timers
        clearInterval(increaseTimer);
        clearInterval(decreaseTimer);
        increaseTimer = null;
        decreaseTimer = null;
        
        // Save logs to local storage
        localStorage.setItem('logs', JSON.stringify(logs));
        
        // Reset session type and start time
        sessionType = null;
        startTime = null;

        // Display the updated logs
        displayLogs();
    }
};

// Show Logs
document.getElementById('viewLogButton').onclick = function() {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('logPage').style.display = 'block';
    document.getElementById('exportButton').style.display = 'inline-block'; // Show the export button
    displayLogs();
};

// Show Home
document.getElementById('homeButton').onclick = function() {
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('logPage').style.display = 'none';
    document.getElementById('exportButton').style.display = 'none'; // Hide the export button
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

// Function to update time based on input from a prompt
document.getElementById('updateTimeButton').onclick = function() {
    // Use a prompt to get the number of minutes from the user
    let inputMinutes = prompt("Enter minutes to add or subtract (e.g., 20 or -20):");

    // Check if the input is not null and is a valid number (positive or negative)
    if (inputMinutes !== null && /^-?\d+$/.test(inputMinutes.trim())) {
        // Parse the input value as an integer
        let minutesToUpdate = parseInt(inputMinutes.trim(), 10);

        // Convert minutes to seconds
        let timeChange = minutesToUpdate * 60;

        // Update elapsedTime with the time change
        elapsedTime += timeChange;

        // Update display and logs
        updateDisplay();
        addLogEntry(timeChange >= 0 ? 'Manual Addition' : 'Manual Subtraction', timeChange);
    } else if (inputMinutes !== null) {
        // If inputMinutes is not null and input is invalid, alert the user
        alert('Please enter a valid whole number for minutes.');
    }
};

// This function will be called when the page is reloaded or when the tab is focused again.
function handleVisibilityChange() {
    if (!document.hidden) {
        if (sessionType) {
            // The tab is now in focus again, so update the timer based on the elapsed time while it was in the background.
            updateTimer();
        }
        // Always update the display when the tab is refocused.
        updateDisplay();
    }
}

// Listen for visibility change events.
document.addEventListener('visibilitychange', handleVisibilityChange, false);

// Function to start increasing or decreasing time
function startTimer(isIncrease) {
    if (!timerInterval) {
        // Set the sessionType to 'increase' or 'decrease'
        sessionType = isIncrease ? 'increase' : 'decrease';
        startTime = Date.now(); // Record the start time of the session
        timerInterval = setInterval(() => {
            // This is just to keep the display updated, no longer to keep track of time
            updateDisplay();
        }, 1000);
    }
}

// Function to stop the timer and log the elapsed time
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval); // Stop the updating interval
        timerInterval = null;

        let endTime = Date.now();
        let sessionDuration = Math.floor((endTime - startTime) / 1000);

        if (sessionType === 'decrease') {
            sessionDuration = -sessionDuration; // Make the duration negative for decreasing
        }

        // Adjust the total elapsedTime based on the session
        elapsedTime += sessionDuration;
        logs.push({
            start: new Date(startTime),
            end: new Date(endTime),
            duration: sessionDuration
        });

        // Reset startTime and sessionType
        startTime = null;
        sessionType = null;

        // Save logs to local storage
        localStorage.setItem('logs', JSON.stringify(logs));
        localStorage.setItem('elapsedTime', elapsedTime);

        // Update display
        updateDisplay();
        displayLogs();
    }
}

// Function to update the timer based on the session type and elapsed time
function updateTimer() {
    if (sessionType) {
        let currentTime = Date.now();
        let sessionDuration = Math.floor((currentTime - startTime) / 1000); // Calculate the duration since the session started

        if (sessionType === 'increase') {
            elapsedTime += sessionDuration;
        } else if (sessionType === 'decrease') {
            elapsedTime = Math.max(0, elapsedTime - sessionDuration); // Prevent negative time
        }

        startTime = currentTime; // Reset the start time for the next update
    }
}

// Call this function right before the page is unloaded or refreshed.
function handleWindowUnload() {
    if (sessionType) {
        // Update the timer to the current time before stopping.
        updateTimer();
        // Log the session only if the duration is positive.
        if (sessionStartTime) {
            stopTimer(true); // Log the session
        }
    }
}

// Hook into the window's beforeunload event.
window.addEventListener('beforeunload', handleWindowUnload);

function increaseTime() {
    elapsedTime++;
    localStorage.setItem('elapsedTime', elapsedTime); // Save updated time
    updateDisplay();
}

function decreaseTime() {
    elapsedTime--;
    localStorage.setItem('elapsedTime', elapsedTime); // Save updated time
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


// Override the window.onload function to include visibility change handling and to potentially continue timing
window.onload = function() {
    console.log('Loading stored values...');
    if (localStorage.getItem('elapsedTime')) {
        elapsedTime = parseInt(localStorage.getItem('elapsedTime'));
        console.log('Loaded elapsedTime:', elapsedTime);
    } else {
        console.log('No elapsedTime in localStorage');
    }

    if (localStorage.getItem('logs')) {
        logs = JSON.parse(localStorage.getItem('logs'));
        console.log('Loaded logs:', logs);
    } else {
        console.log('No logs in localStorage');
    }

    // If there was a session running before the window was unloaded, continue it.
    if (sessionType) {
        // The timer was running before, so start it again.
        startTimer(sessionType);
    }

    updateDisplay();
    displayLogs();
};
