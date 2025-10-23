const videoElement = document.getElementById('video');
const button = document.getElementById('button');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');

// Prompt user to select media stream, pass to video element, then play
async function selectMediaStream() {
  try {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia();
    videoElement.srcObject = mediaStream;
    videoElement.onloadedmetadata = () => {
      videoElement.play();
    };
    
    // Add event listener for when the media stream ends
    mediaStream.getTracks()[0].addEventListener('ended', () => {
      button.textContent = 'SELECT SCREEN';
      updateButtonStates();
    });
    
    button.textContent = 'START';
    updateButtonStates();
    return true;
  } catch (error) {
    // Catch Error Here
    console.log('Error selecting media stream:', error);
    button.textContent = 'SELECT SCREEN';
    updateButtonStates();
    return false;
  }
}

async function startPictureInPicture() {
  try {
    // Check if Picture-in-Picture is supported
    if (!document.pictureInPictureEnabled) {
      throw new Error('Picture-in-Picture not supported');
    }
    
    // Check if video is ready
    if (!videoElement.srcObject) {
      throw new Error('No media stream available');
    }
    
    await videoElement.requestPictureInPicture();
    button.textContent = 'STARTED';
    updateButtonStates();
  } catch (error) {
    console.log('Error starting Picture-in-Picture:', error);
    button.textContent = 'ERROR - TRY AGAIN';
    setTimeout(() => {
      button.textContent = 'START';
    }, 2000);
  }
}

function stopPictureInPicture() {
  try {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
      button.textContent = 'START';
    }
    updateButtonStates();
  } catch (error) {
    console.log('Error stopping Picture-in-Picture:', error);
  }
}

function resetApplication() {
  try {
    // Exit Picture-in-Picture if active
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
    
    // Stop media stream
    if (videoElement.srcObject) {
      const tracks = videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;
    }
    
    // Reset button states
    button.textContent = 'SELECT SCREEN';
    updateButtonStates();
  } catch (error) {
    console.log('Error resetting application:', error);
  }
}

function updateButtonStates() {
  const hasMediaStream = videoElement.srcObject !== null;
  const isInPiP = document.pictureInPictureElement !== null;
  
  // Update stop button
  stopButton.disabled = !isInPiP;
  stopButton.style.opacity = isInPiP ? '1' : '0.6';
  
  // Reset button is always available if there's a media stream
  resetButton.disabled = !hasMediaStream;
  resetButton.style.opacity = hasMediaStream ? '1' : '0.6';
}

button.addEventListener('click', async () => {
  // Disable button during operation
  button.disabled = true;
  
  if (button.textContent === 'SELECT SCREEN') {
    // First get the media stream
    const success = await selectMediaStream();
    if (success) {
      button.textContent = 'START';
      updateButtonStates();
    }
  } else if (button.textContent === 'START') {
    // Start Picture in Picture
    await startPictureInPicture();
  }
  
  // Re-enable button
  button.disabled = false;
});

// Stop button event listener
stopButton.addEventListener('click', () => {
  stopPictureInPicture();
});

// Reset button event listener
resetButton.addEventListener('click', () => {
  resetApplication();
});

// Handle when Picture-in-Picture ends
videoElement.addEventListener('leavepictureinpicture', () => {
  button.textContent = 'START';
  updateButtonStates();
});

// Handle when media stream ends
videoElement.addEventListener('ended', () => {
  button.textContent = 'SELECT SCREEN';
  updateButtonStates();
});

// Handle when Picture-in-Picture starts
videoElement.addEventListener('enterpictureinpicture', () => {
  updateButtonStates();
});

// Initialize
button.textContent = 'SELECT SCREEN';
updateButtonStates();
