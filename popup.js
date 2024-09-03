const start = document.querySelector('.fa-g');
const downloadbtn = document.querySelector('.fa-file-arrow-down');

// Function to display/hide start/stop btns
function loadContent(){
    downloadbtn.style.display = 'none';
    start.style.display = 'flex';
}

// Function to program the start btn
function startBtnFn(){
    downloadbtn.style.display = 'flex';
    start.style.display = 'none';
    chrome.runtime.sendMessage({ action: 'startRecording' });
}


// Function to program the stop btn
function stopBtnFn(){
    start.style.display = 'flex';
    chrome.runtime.sendMessage({ action: 'stopRecording' });
}

document.addEventListener('DOMContentLoaded', loadContent);
start.addEventListener('click', startBtnFn);
downloadbtn.addEventListener('click', stopBtnFn);