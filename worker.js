let intervalId;
let startTime;
let type; // 'increase' or 'decrease'

self.onmessage = function (event) {
    const data = event.data;
    switch (data.command) {
        case 'start':
            startTime = data.startTime;
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
            postMessage({ stopped: true });
            break;
    }
};