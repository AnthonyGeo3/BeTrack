let intervalId;
let startTime;
let type; // 'increase' or 'decrease'
let lastStopTime; // New variable to store the last stop time

self.onmessage = function (event) {
    const data = event.data;
    switch (data.command) {
        case 'start':
            if (lastStopTime) {
                // Adjust startTime to account for elapsed time
                startTime = Date.now() - (lastStopTime - startTime);
            } else {
                startTime = data.startTime;
            }
            type = data.type;
            intervalId = setInterval(() => {
                const currentTime = Date.now();
                let elapsed = (currentTime - startTime) / 1000;
                elapsed = type === 'increase' ? elapsed : -elapsed;
                postMessage({ elapsed });
            }, 1000);
            break;
        case 'stop':
            clearInterval(intervalId);
            lastStopTime = Date.now(); // Store the stop time
            postMessage({ stopped: true });
            break;
    }
};