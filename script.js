document.addEventListener('DOMContentLoaded', (event) => {
    let timerValue = 0;
    let activities = [];
    let categories = new Set();
    let timerId = null;

    const myWorker = new Worker('HackTimerWorker.js');

    myWorker.onmessage = function(e) {
        if (e.data === 'tick') {
            // Update timer value and UI
            timerValue += (timerId === 'increase' ? 1 : -1);
            timerValue = Math.max(0, timerValue); // Prevent negative values
            updateTimeDisplay();
        }
    };

    const updateTimeDisplay = () => {
        document.getElementById('timeDisplay').innerText = `Time: ${timerValue}`;
    };

    const logActivity = (type, amount, category) => {
        const timestamp = new Date().toLocaleString();
        activities.push({ type, amount, category, timestamp });
        updateActivityLog();
    };

    const updateActivityLog = () => {
        const logElement = document.getElementById('activityLog');
        logElement.innerHTML = '';
        activities.forEach(activity => {
            const entry = document.createElement('div');
            entry.innerText = `${activity.timestamp}: ${activity.type} ${activity.amount} - ${activity.category}`;
            logElement.appendChild(entry);
        });
    };

    const startTimer = (increment = true) => {
        myWorker.postMessage({command: 'start'});
        timerId = increment ? 'increase' : 'decrease';
    };

    const stopTimer = () => {
        myWorker.postMessage({command: 'stop'});
        timerId = null;
    };

    // Attach functions to buttons
    document.getElementById('startButton').addEventListener('click', () => {
        startTimer(true);
        logActivity('Increase', 1, 'Custom Category'); // Replace with actual category logic
    });

    document.getElementById('reduceButton').addEventListener('click', () => {
        startTimer(false);
        logActivity('Decrease', 1, 'Custom Category'); // Replace with actual category logic
    });

    document.getElementById('stopButton').addEventListener('click', () => {
        stopTimer();
    });

    document.getElementById('updateTimeButton').addEventListener('click', () => {
        // Implement manual time adjustment logic
    });

    document.getElementById('viewLogButton').addEventListener('click', () => {
        document.getElementById('logPage').style.display = 'block';
    });

    document.getElementById('homeButton').addEventListener('click', () => {
        document.getElementById('logPage').style.display = 'none';
    });

    // Additional functionality for exporting logs and category management can be added here.
});
