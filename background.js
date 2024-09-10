// background.js
let recording = false;
let data = [];
let activeTabId = null;
let oddNumbers = false;

/**
 * Function that receives the messages from the popup and executes appropriate functions
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'startRecording') {
    let maxCount = (request.maxCount !== undefined && request.maxCount !== null) ? request.maxCount : Infinity;
    if(maxCount%2) {
      maxCount++;
      oddNumbers=true;
    }
    recording=true;
    startRecording(maxCount);
    sendResponse({ recording: recording });
  } else if (request.action === 'stopRecording') { // recording stopped manually by the user
    console.log(`stopped already`);
    recording=false;
    sendResponse({ recording: recording });
    downloadData();
    stopRecording();
  } else if(request.action === 'recordingStopped') { // recording stopped programatically by content.js because limit reached
    recording=false;
    sendResponse({ recording: recording });
    downloadData();  
    stopRecording();
  }else if (request.action === 'checkStatus') {
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
async function startRecording(maxCount) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tabs[0]?.id;

  if (tabs.length === 0) {
    console.log(`maxCount: `, maxCount);
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
      console.log('maxCount being sent to the content.js: ', maxCount);
      chrome.tabs.sendMessage(activeTabId, { action: 'start', maxCount: maxCount === Infinity ? -1 : maxCount }, (response) => {
        if (chrome.runtime.lastError) {
            console.error(`Error sending message: ${chrome.runtime.lastError.message}`);
        } else {
            console.log('Message sent to content.js successfully', response);
        }
    });
    
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
  let csvContent = "";
  let adjustedLength = (oddNumbers) ? (data.length-1) : data.length;
  console.log(`adjusted length is: `, adjustedLength);
  // Add the adjusted data to the CSV
  for (let i = 0; i < adjustedLength; i++) {
    const point = data[i];
    csvContent += `${point.x},${point.y}\n`;
    if(i==adjustedLength-1) {
      if(oddNumbers) {
        csvContent += `${point.x}\n`;
      } else {
        csvContent += `${point.x},${point.y}\n`;
      }
    }
  }

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