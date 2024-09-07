const start = document.querySelector('.start-btn');
const downloadbtn = document.querySelector('.download-btn');

// Function to display/hide start/stop btns
function loadContent(){
    chrome.runtime.sendMessage({ action: 'checkStatus' }, (response) => {
        if (response.recording) {
            downloadbtn.style.display = 'flex';
            start.style.display = 'none';
        } else {
            downloadbtn.style.display = 'none';
            start.style.display = 'flex';
        }
    });
}

// Function to program the start btn
function startBtnFn(){
    chrome.runtime.sendMessage({ action: 'startRecording' }, (response) => {
        if (response.recording) {
            downloadbtn.style.display = 'flex';
            start.style.display = 'none';
        }
    });
}

// Function to program the stop btn
function stopBtnFn(){
    chrome.runtime.sendMessage({ action: 'stopRecording' }, (response) => {
        if (!response.recording) {
            downloadbtn.style.display = 'none';
            start.style.display = 'flex';
        }
    });
}

document.addEventListener('DOMContentLoaded', loadContent);
start.addEventListener('click', startBtnFn);
downloadbtn.addEventListener('click', stopBtnFn);