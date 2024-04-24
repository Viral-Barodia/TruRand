// content.js

console.log(`It actually works!`);

// Function to send cursor coordinates to the background script
function sendCursorCoordinates(event) {
    console.log(`Content script`);
    console.log(`${event.pageX}`);
    chrome.runtime.sendMessage({ type: 'cursor', x: event.pageX, y: event.pageY });
}
  
// Listen for mouse movement events and send cursor coordinates
document.addEventListener('mousemove', sendCursorCoordinates);
