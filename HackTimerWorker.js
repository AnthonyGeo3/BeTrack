// This script will be executed in a Web Worker.
self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.command) {
        case 'start':
            // Start a new timer
            self.timerId = setInterval(function() {
                postMessage('tick');
            }, 1000); // Sends a message back every second
            break;
        case 'stop':
            // Stop the current timer
            clearInterval(self.timerId);
            break;
    }
}, false);
