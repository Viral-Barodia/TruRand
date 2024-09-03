console.log('Content script loaded and running.');
let recording = false;

function sendCursorCoordinates(event) {
    console.log(`Mouse moved to: x=${event.pageX}, y=${event.pageY}`);
    chrome.runtime.sendMessage({
        x: event.pageX,
        y: event.pageY
    });
}

function startRecording() {
    console.log('Start recording');
    recording = true;
    document.addEventListener('mousemove', sendCursorCoordinates);
}

function stopRecording() {
    console.log('Stop recording');
    recording = false;
    document.removeEventListener('mousemove', sendCursorCoordinates);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content.js:', request);

    if (request.action === 'start') {
        startRecording();
    } else if (request.action === 'stop') {
        stopRecording();
    }
});
