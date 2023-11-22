let intervalId;
let startTime;
let type;
let initialElapsedTime = 0; // Variable to hold initial elapsed time

self.onmessage = function(event) {
    const data = event.data;
    switch (data.command) {
        case 'start':
            startTime = data.startTime;
            type = data.type;
            initialElapsedTime = data.elapsedTime || 0; // Set initialElapsedTime

            // Ensure any existing interval is cleared before starting a new one
            clearInterval(intervalId);

            intervalId = setInterval(() => {
                const currentTime = Date.now();
                let elapsed;

                if (type === 'increase') {
                    elapsed = ((currentTime - startTime) / 1000) + initialElapsedTime;
                } else if (type === 'decrease') {
                    // Decrease from the initialElapsedTime
                    elapsed = initialElapsedTime - ((currentTime - startTime) / 1000);
                    elapsed = Math.max(0, elapsed); // Ensure it doesn't go below 0
                }

                postMessage({ elapsed });
            }, 1000);
            break;
        case 'stop':
            clearInterval(intervalId);
            break;
    }
};