const start = document.querySelector('.fa-g');
const stop = document.querySelector('.fa-circle-stop');
const downloadbtn = document.querySelector('.fa-download');
let capturedData = '';

function mousehandler(event){

    capturedData += generateRandomNos(event);
}

// Function to generate random numbers
function generateRandomNos(e){

    const xcoord = event.clientX;
    const ycoord = event.clientY;

    return parseInt(xcoord) + parseInt(ycoord);
}

// Function to save the incoming numbers to a file and download it
function saveToFile(data, filename){

    // console.log("clicked!")
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Function to program the start btn
function startbtnfn(e){

    start.style.display='none';
    stop.style.display='flex';

    document.addEventListener('mousemove', mousehandler);
}

// Function to program the stop btn
function stopbtnfn(){

    start.style.display='flex';
    stop.style.display='none';

    document.removeEventListener('mousemove', mousehandler);
}

// Function to program the download btn

function loadContent(){
    start.style.display='flex';
    stop.style.display='none';
}

function downloadFiles(){

    if(capturedData.trim() !== '')
        saveToFile(capturedData, 'RandomNumbers.txt');
    else{
        alert("Kindly start the extension to generate numbers");
        return;
    }
}


document.addEventListener('DOMContentLoaded', loadContent);

start.addEventListener('click', startbtnfn);
stop.addEventListener('click', stopbtnfn);
downloadbtn.addEventListener('click', downloadFiles);