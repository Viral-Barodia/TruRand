const start = document.querySelector(".start-btn");
const downloadbtn = document.querySelector(".download-btn");
const userEnteredMaxCount = document.getElementById("max-count-input");
const minValueInput = document.getElementById("min-value-input");
const maxValueInput = document.getElementById("max-value-input");
const errorMessage = document.getElementById("error-message");

/*
 * Function to display/hide start/stop btns
 */
function loadContent() {
  chrome.runtime.sendMessage({ action: "checkStatus" }, (response) => {
    if (response.recording) {
      downloadbtn.style.display = "flex";
      start.style.display = "none";
    } else {
      downloadbtn.style.display = "none";
      start.style.display = "flex";
    }
  });
}

/*
 * Function to program the start btn
 */
function startBtnFn() {
  if (validateInput()) {
    const maxCount = userEnteredMaxCount.value
      ? parseInt(userEnteredMaxCount.value)
      : Infinity;
    const minValue = minValueInput.value ? parseInt(minValueInput.value) : null;
    const maxValue = maxValueInput.value ? parseInt(maxValueInput.value) : null;

    chrome.runtime.sendMessage(
      {
        action: "startRecording",
        maxCount: maxCount,
        minValue: minValue,
        maxValue: maxValue,
      },
      (response) => {
        if (response.recording) {
          downloadbtn.style.display = "flex";
          start.style.display = "none";
        }
      }
    );
  } else {
    console.error("Invalid input, cannot start recording");
  }
}

/*
 * Function to program the stop btn
 */
function stopBtnFn() {
  chrome.runtime.sendMessage({ action: "stopRecording" }, (response) => {
    if (!response.recording) {
      downloadbtn.style.display = "none";
      start.style.display = "flex";
    }
  });
}

/*
 * Function to validate the input button
 */
function validateInput() {
  const value = userEnteredMaxCount.value;
  if (value === "" || (parseInt(value) > 0 && !isNaN(value))) {
    errorMessage.style.display = "none";
    return true;
  } else {
    errorMessage.style.display = "inline";
    return false;
  }
}

/**
 * Event listeners for when the user interacts
 */
document.addEventListener("DOMContentLoaded", loadContent);
start.addEventListener("click", startBtnFn);
downloadbtn.addEventListener("click", stopBtnFn);
userEnteredMaxCount.addEventListener("input", () => {
  validateInput();
});
