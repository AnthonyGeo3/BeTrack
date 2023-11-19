document.addEventListener('DOMContentLoaded', (event) => {
    let timerValue = 0;
    let activities = [];
    let categories = new Set();

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

    document.getElementById('startButton').addEventListener('click', () => {
        timerValue++;
        updateTimeDisplay();
        logActivity('Increase', 1, 'Custom Category'); // Example, replace with actual category logic
    });

    document.getElementById('reduceButton').addEventListener('click', () => {
        timerValue = Math.max(0, timerValue - 1);
        updateTimeDisplay();
        logActivity('Decrease', 1, 'Custom Category'); // Example, replace with actual category logic
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