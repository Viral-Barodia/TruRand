// background.js

let recording = false;
let data = [];

// Function to handle messages from content script
chrome.runtime.onMessage.addListener(function(message) {

  console.log(`1. Recording is now set to: ${recording} and the message type is: ${message.type}`);
  if (recording && message.type === 'cursor') {
    console.log(`X: ${message.x} | Y: ${message.y}`);
    data.push({ x: message.x, y: message.y });
  }
});

chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === 'startRecording') {
      console.log(`Message received in background as: ${message.action}`);
      startRecording(message);
    }
    else if(message.action == 'stopRecording'){
        stopRecording();
    }
    else if(message.action == 'downloadData'){
        downloadData();
    }
});

// Function to start recording
function startRecording(message) {
  recording = true;
  console.log(`2. Recording is now set to: ${recording} and the message type is: ${message.type} and the message is: ${JSON.stringify(message)}`);
  if (recording && message.type === 'cursor') {
    console.log(`Inside startRec`);
    
    console.log(`X: ${message.x}, Y: ${message.y}`);
    data.push({ x: message.x, y: message.y });
  }
}

// Function to stop recording
function stopRecording() {
  recording = false;
  downloadData();
}

// Function to download data
function downloadData() {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });

  // Use FileReader to read the Blob data and initiate download
  const reader = new FileReader();
  reader.onload = function(event) {
    const base64Data = event.target.result;
    const url = 'data:application/json;base64,' + btoa(base64Data);

    chrome.downloads.download({
      url: url,
      filename: 'cursor_data.json',
      saveAs: true
    });
  };
  reader.readAsText(blob);
}