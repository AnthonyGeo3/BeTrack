let increaseTimer = null;
let decreaseTimer = null;
let elapsedTime = 0;
let startTime = null;
let logs = [];
let sessionType = null; // 'increase' or 'decrease'
// hello anthony
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

// Function to handle visibility change or page unload
function handleVisibilityOrUnload() {
    // Calculate elapsed time since the last start
    if (sessionStartTime) {
        let currentElapsed = (Date.now() - sessionStartTime) / 1000;
        if (sessionType === 'increase') {
            elapsedTime += currentElapsed;
        } else if (sessionType === 'decrease') {
            elapsedTime = Math.max(0, elapsedTime - currentElapsed);
        }
        updateDisplay();
        // Save the new elapsed time
        localStorage.setItem('elapsedTime', elapsedTime.toString());
        // Reset session start time for a new session
        sessionStartTime = Date.now();
        localStorage.setItem('sessionStartTime', sessionStartTime.toString());
    }
}

// Listen for visibility change and window unload events
document.addEventListener('visibilitychange', handleVisibilityOrUnload);
window.addEventListener('beforeunload', handleVisibilityOrUnload);

// Function to start timing
function startTiming(isIncreasing) {
    sessionType = isIncreasing ? 'increase' : 'decrease';
    // Save the session type
    localStorage.setItem('sessionType', sessionType);
    // Get the current time and save it as the session start time
    sessionStartTime = Date.now();
    localStorage.setItem('sessionStartTime', sessionStartTime.toString());
    // Start the interval to update the display
    if (!increaseTimer && !decreaseTimer) {
        timerInterval = setInterval(updateDisplay, 1000);
    }
}

// Function to stop timing and log the session
function stopTiming() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    handleVisibilityOrUnload(); // Update elapsed time before stopping
    // Log the session
    logs.push({
        start: new Date(sessionStartTime),
        end: new Date(),
        duration: sessionType === 'increase' ? elapsedTime : -elapsedTime,
        category: sessionType
    });
    // Reset sessionType and sessionStartTime
    sessionType = null;
    sessionStartTime = null;
    // Clear session information from localStorage
    localStorage.removeItem('sessionType');
    localStorage.removeItem('sessionStartTime');
    // Save logs and update the display
    localStorage.setItem('logs', JSON.stringify(logs));
    displayLogs();
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
        updateTimer();
        localStorage.setItem('sessionStartTime', sessionStartTime);
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

function logSession(duration, type) {
    let endTime = Date.now();
    let startTime = endTime - duration * 1000; // Calculate the start time

    logs.push({
        start: new Date(startTime),
        end: new Date(endTime),
        duration: Math.abs(duration),
        category: type
    });

    updateLogDisplayAndStorage();
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

        // Determine the sign of the duration
        let sign = log.duration < 0 ? "-" : "";

        // Convert absolute value of log.duration from seconds into hours, minutes, and seconds
        let duration = Math.abs(log.duration);
        let hours = Math.floor(duration / 3600);
        let minutes = Math.floor((duration % 3600) / 60);
        let seconds = duration % 60;

        // Build the formatted duration string with the sign
        let formattedDuration = sign +
            (hours > 0 ? hours + " h " : "") +
            ((hours > 0 || minutes > 0) ? minutes + " m " : "") +
            seconds + " s  ";

        let logDetailsSpan = document.createElement('span');
        logDetailsSpan.className = 'log-details';
        logDetailsSpan.textContent = `Start: ${new Date(log.start).toLocaleString()}, End: ${new Date(log.end).toLocaleString()}, Duration: ${formattedDuration}`;

        // Append the log details to the entry div
        logEntryDiv.appendChild(logDetailsSpan);

        // Create a span for category display
        let categorySpan = document.createElement('span');
        categorySpan.id = `category-${index}`;
        categorySpan.className = 'log-category';
        categorySpan.textContent = log.category ? `  Category: ${log.category}` : '  Category: None';

        // Create a div for buttons
        let buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'log-buttons';

        // Create the category button
        let categoryButton = document.createElement('button');
        categoryButton.textContent = 'Category';
        categoryButton.onclick = function() {
            addCategory(index, `category-${index}`);
        };

        // Create the delete button
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            removeLog(index);
        };

         // Append buttons to the buttons div
         buttonsDiv.appendChild(categoryButton);
         buttonsDiv.appendChild(deleteButton);
 
         // Append the category span and buttons div to the entry div
         logEntryDiv.appendChild(categorySpan);
         logEntryDiv.appendChild(buttonsDiv);
 
         // Append the entry div to the log container
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


// Function to handle page load
window.onload = function() {
    // Retrieve stored values
    elapsedTime = parseInt(localStorage.getItem('elapsedTime')) || 0;
    sessionStartTime = parseInt(localStorage.getItem('sessionStartTime'));
    sessionType = localStorage.getItem('sessionType');
    logs = JSON.parse(localStorage.getItem('logs')) || [];

    // Update display based on the stored elapsed time
    updateDisplay();
    // If a session was ongoing, continue it
    if (sessionType && sessionStartTime) {
        startTiming(sessionType === 'increase');
    }
    displayLogs();
};
