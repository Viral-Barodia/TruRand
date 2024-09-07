// background.js
let recording = false;
let data = [];
let activeTabId = null;

/**
 * Function that receives the messages from the popup and executes appropriate functions
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'startRecording') {
      recording=true;
      startRecording();
      sendResponse({ recording: recording });
    } else if (request.action === 'stopRecording') {
      stopRecording();
      recording=false;
      sendResponse({ recording: recording });
      downloadData();
  } else if (request.action === 'checkStatus') {
      sendResponse({ recording: recording });
  } else if (recording && request.x !== undefined && request.y !== undefined) {
      data.push({ x: request.x, y: request.y });
  } else {
      sendResponse({ status: 'Unknown action' });
  }
});

/**
 * Function to start recording co-ordinates by sending message to the content script
 * @returns void
 */
async function startRecording() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tabs[0]?.id;

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
  } catch (error) {
      console.error('Failed to inject content script:', error);
  }
}

/**
 * Function to stop the recording by sending a message to the content script
 */
async function stopRecording() {
  try {
    if (activeTabId) {
      const tab = await chrome.tabs.get(activeTabId);
      if(tab) {
        chrome.tabs.sendMessage(activeTabId, { action: 'stop' }, response => {
          if (chrome.runtime.lastError) {
              console.error(`Error sending stop message: ${chrome.runtime.lastError.message}`);
          } else {
              console.log('Stop message sent successfully');
          }
        });
      } else {
        console.error("No active tab found");
      }
    } else {
      console.error('Active tab ID is not set.');
    }
  } catch (e) {
    console.error("Failed to send stop message", e);
  }
}

/**
 * Function to download a CSV containing the data
 * @returns void
 */
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
          data = [];
          recording=false;
      });
  };
  reader.readAsDataURL(blob);
}