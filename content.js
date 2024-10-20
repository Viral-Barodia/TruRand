// variables
let recording = false;
let count = 0,
  maxCount = 0;
let minValue = null,
  maxValue = null;

/**
 * Function to track the users mouse movements subject to the maxCount
 * @param event => For recording the cursor position
 */
function sendCursorCoordinates(event) {
  if (count < maxCount) {
    let x = event.pageX;
    let y = event.pageY;

    // Apply min and max value constraints
    if (minValue !== null) {
      x = Math.max(x, minValue);
      y = Math.max(y, minValue);
    }
    if (maxValue !== null) {
      x = Math.min(x, maxValue);
      y = Math.min(y, maxValue);
    }

    chrome.runtime.sendMessage({
      x: x,
      y: y,
    });
    count += 2;
  } else {
    stopRecording();
  }
}

/**
 * Function to add the event listener to track mouse movements
 * @param receivedMaxCount => The maxCount that user might have entered
 * @param receivedMinValue => The minimum value for the random numbers
 * @param receivedMaxValue => The maximum value for the random numbers
 */
function startRecording(receivedMaxCount, receivedMinValue, receivedMaxValue) {
  recording = true;
  count = 0;
  maxCount = Math.min(receivedMaxCount, Infinity);
  minValue = receivedMinValue;
  maxValue = receivedMaxValue;
  document.addEventListener("mousemove", sendCursorCoordinates);
}

/**
 * Function to remove the event listener for recording mouse movements once enough numbers are generated
 */
function stopRecording() {
  if (!recording) return;
  recording = false;
  document.removeEventListener("mousemove", sendCursorCoordinates);
  chrome.runtime.sendMessage({ action: "recordingStopped" });
}

/**
 * Listener that receives an appropriate message from the background script and delegates work to the corresponding function
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start") {
    const receivedMaxCount =
      request.maxCount === -1 ? Infinity : request.maxCount;
    startRecording(receivedMaxCount, request.minValue, request.maxValue);
    sendResponse({ status: "Recording started" });
  } else if (request.action === "stop") {
    stopRecording();
    sendResponse({ status: "Recording stopped" });
  }
});
