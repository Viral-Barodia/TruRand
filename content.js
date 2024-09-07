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
    recording = true;
    document.addEventListener('mousemove', sendCursorCoordinates);
}

function stopRecording() {
    recording = false;
    document.removeEventListener('mousemove', sendCursorCoordinates);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
        startRecording();
        sendResponse({ status: 'Recording started' });
    } else if (request.action === 'stop') {
        console.log('Stop command received in content script');
        stopRecording();
        sendResponse({ status: 'Recording stopped' });
    }
});
