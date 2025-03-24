// Function to display the current time
function displayCurrentTime() {
    const timeDisplay = document.getElementById('timeDisplay');
    const now = new Date();

    // Format the time (e.g., 4:30:45 PM)
    const formattedTime = now.toLocaleTimeString('en-US', { hour12: true });

    // Update the time display
    timeDisplay.textContent = formattedTime;
}

// Update the time every second
setInterval(displayCurrentTime, 1000);

// Call the function initially to show the time immediately
displayCurrentTime();



