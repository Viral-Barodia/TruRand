const start = document.querySelector('.fa-g');
const stop = document.querySelector('.fa-circle-stop');
const downloadbtn = document.querySelector('.fa-download');

// Function to display/hide start/stop btns
function loadContent(){
    stop.style.display = 'none';
    start.style.display = 'flex';
}

// Function to program the start btn
function startBtnFn(){
    stop.style.display = 'flex';
    start.style.display = 'none';
    console.log("Message sent from popup");
    chrome.runtime.sendMessage({ action: 'startRecording', type: 'cursor' });
}


// Function to program the stop btn
function stopBtnFn(){
    stop.style.display = 'none';
    start.style.display = 'flex';
    chrome.runtime.sendMessage({ action: 'stopRecording' });
}

// Function to program the download btn
function downloadFiles(){
    chrome.runtime.sendMessage({ action: 'downloadData' });
}

document.addEventListener('DOMContentLoaded', loadContent);
start.addEventListener('click', startBtnFn);
stop.addEventListener('click', stopBtnFn);
downloadbtn.addEventListener('click', downloadFiles);