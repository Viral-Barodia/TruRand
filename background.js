// Variables
let recording = false;
let data = [];
let activeTabId = null;
let oddNumbers = false;

/**
 * Function that receives the messages from the popup and executes appropriate functions
 * @param request => The request as received from the popup.js
 * @param sender
 * @param sendResponse => To let the popup.js know the status of operations
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startRecording") {
    let maxCount =
      request.maxCount !== undefined && request.maxCount !== null
        ? request.maxCount
        : Infinity;
    if (maxCount % 2 == 1) {
      maxCount++;
      oddNumbers = true;
    }
    recording = true;
    startRecording(maxCount, request.minValue, request.maxValue);
    sendResponse({ recording: recording });
  } else if (request.action === "stopRecording") {
    // recording stopped manually by the user
    recording = false;
    sendResponse({ recording: recording });
    stopRecording();
    downloadData();
  } else if (request.action === "recordingStopped") {
    // recording stopped programatically by content.js because limit reached
    recording = false;
    sendResponse({ recording: recording });
    stopRecording();
    downloadData();
  } else if (request.action === "checkStatus") {
    sendResponse({ recording: recording });
  } else if (recording && request.x !== undefined && request.y !== undefined) {
    data.push({ x: request.x, y: request.y });
  } else {
    sendResponse({ status: "Unknown action" });
  }
});

/**
 * Function to start recording co-ordinates by sending message to the content script
 * @param maxCount => The max count of numbers that the user might have entered
 * @param minValue => The minimum value for the random numbers
 * @param maxValue => The maximum value for the random numbers
 */
async function startRecording(maxCount, minValue, maxValue) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tabs[0]?.id;

  if (tabs.length === 0) {
    console.error("No active tabs found in start.");
    return;
  }

  const activeTab = tabs[0];
  const url = activeTab.url;

  // Check if the URL is valid for content script injection
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      // Inject content script if not already injected
      await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        files: ["content.js"],
      });
      // Send a message to content script
      chrome.tabs.sendMessage(
        activeTabId,
        {
          action: "start",
          maxCount: maxCount === Infinity ? -1 : maxCount,
          minValue: minValue,
          maxValue: maxValue,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error sending message: ${chrome.runtime.lastError.message}`
            );
          } else {
            console.log("Message sent to content.js successfully", response);
          }
        }
      );
    } catch (error) {
      console.error("Failed to inject content script:", error);
    }
  } else {
    console.error("Cannot inject content script into this URL:", url);
  }
}

/**
 * Function to stop the recording by sending a message to the content script
 */
async function stopRecording() {
  try {
    if (activeTabId) {
      const tab = await chrome.tabs.get(activeTabId);
      if (tab) {
        chrome.tabs.sendMessage(activeTabId, { action: "stop" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error sending stop message: ${chrome.runtime.lastError.message}`
            );
          } else {
            console.log("Stop message sent successfully");
          }
        });
      } else {
        console.error("No active tab found");
      }
    } else {
      console.error("Active tab ID is not set.");
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
  let adjustedLength = oddNumbers ? data.length - 1 : data.length;
  if (adjustedLength <= 0 || data.length === 0) {
    console.error("No data recorded.");
    return;
  }

  // Convert data to CSV format
  let csvContent = "";
  // Add the adjusted data to the CSV
  for (let i = 0; i < adjustedLength; i++) {
    const point = data[i];
    csvContent += `${point.x},${point.y}\n`;
    if (i == adjustedLength - 1 && oddNumbers) {
      csvContent += `${point.x}\n`;
    }
  }

  // Create a Blob object from the CSV content
  const blob = new Blob([csvContent], { type: "text/csv" });

  // Use FileReader to read the Blob data and initiate download
  const reader = new FileReader();
  reader.onload = function (event) {
    const url = event.target.result;

    // Trigger the download using the base64 URL
    chrome.downloads.download(
      {
        url: url,
        filename: "RandomNumbers.csv",
        saveAs: true,
      },
      function () {
        data = [];
        recording = false;
      }
    );
  };
  reader.readAsDataURL(blob);
}
