// background.js
let recording = false;
let data = [];
let activeTabId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background.js:', request);

  if (request.action === 'startRecording') {
      console.log('Start Recording action received.');
      recording=true;
      startRecording();
  } else if (request.action === 'stopRecording') {
      console.log('Stop Recording action received.');
      recording=false;
      downloadData();
      stopRecording();
  } else if (recording && request.x !== undefined && request.y !== undefined) {
      console.log(`Cursor data received: x=${request.x}, y=${request.y}`);
      data.push({ x: request.x, y: request.y });
  } else {
      sendResponse({ status: 'Unknown action' });
  }
});

async function startRecording() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tabs[0].id;
  console.log('Tabs start:', tabs);

  if (tabs.length === 0) {
    console.error('No active tabs found in start.');
    return;
  }
  try {
      // Inject content script if not already injected
      await chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          files: ['content.js']
      });
      // Send a message to content script
      chrome.tabs.sendMessage(activeTabId, { action: 'start' });
      console.log('Content script injected and message sent.');
  } catch (error) {
      console.error('Failed to inject content script:', error);
  }
}

async function stopRecording() {
  try {
    chrome.tabs.sendMessage(activeTabId, { action: 'stop' });
  } catch (e) {
    console.error("Failed to send stop message", e);
  }
}

function downloadData() {
  // Check if data is not empty before proceeding
  if (data.length === 0) {
      console.error("No data recorded.");
      return;
  }

  // Convert data to CSV format
  let csvContent = "x,y\n";
  data.forEach(point => {
      csvContent += `${point.x},${point.y}\n`;
  });

  console.log("CSV Content:", csvContent);

  // Create a Blob object from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv' });

  // Use FileReader to read the Blob data and initiate download
  const reader = new FileReader();
  reader.onload = function(event) {
      const url = event.target.result;

      // Trigger the download using the base64 URL
      chrome.downloads.download({
          url: url,
          filename: 'RandomNumbers.csv',
          saveAs: true
      }, function() {
          console.log("Download initiated.");
          data = [];
      });
  };
  reader.readAsDataURL(blob);
}