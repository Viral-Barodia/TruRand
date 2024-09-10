console.log('Content script loaded and running.');
let recording = false;
let count=0, maxCount=0;

function sendCursorCoordinates(event) {
    if(count < maxCount) {
        console.log(`Mouse moved to: x=${event.pageX}, y=${event.pageY}`);
        chrome.runtime.sendMessage({
            x: event.pageX,
            y: event.pageY
        });
        count += 2;
    } else {
        stopRecording();
        console.log("Reached maximum limit");
    }
}

function startRecording(receivedMaxCount) {
    recording = true;
    count=0;
    maxCount=Math.min(receivedMaxCount, Infinity);
    console.log(`started recording in content.js with`, receivedMaxCount);
    document.addEventListener('mousemove', sendCursorCoordinates);
}

function stopRecording() {
    if (!recording) return;
    recording = false;
    document.removeEventListener('mousemove', sendCursorCoordinates);
    chrome.runtime.sendMessage({ action: 'recordingStopped' }, () => {
        console.log('Background script informed that recording has stopped.');
    });
    console.log('Recording stopped.');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'start') {
        const receivedMaxCount = request.maxCount === -1 ? Infinity : request.maxCount;
        console.log(`request in content.js`, JSON.stringify(request));
        startRecording(receivedMaxCount);
        sendResponse({ status: 'Recording started' });
    } else if (request.action === 'stop') {
        console.log('Stop command received in content script');
        stopRecording();
        sendResponse({ status: 'Recording stopped' });
    }
});
