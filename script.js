const videoElement = document.getElementById('video');
const button = document.getElementById('button');

// Prompt user to select media stream, pass to video element, then play
async function selectMediaStream() {
  try {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia();
    videoElement.srcObject = mediaStream;
    videoElement.onloadedmetadata = () => {
      videoElement.play();
    };
    button.textContent = 'START';
    return true;
  } catch (error) {
    // Catch Error Here
    console.log('Error selecting media stream:', error);
    button.textContent = 'SELECT SCREEN';
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
  } catch (error) {
    console.log('Error starting Picture-in-Picture:', error);
    button.textContent = 'ERROR - TRY AGAIN';
    setTimeout(() => {
      button.textContent = 'START';
    }, 2000);
  }
}

button.addEventListener('click', async () => {
  // Disable button during operation
  button.disabled = true;
  
  if (button.textContent === 'SELECT SCREEN') {
    // First get the media stream
    const success = await selectMediaStream();
    if (success) {
      button.textContent = 'START';
    }
  } else if (button.textContent === 'START') {
    // Start Picture in Picture
    await startPictureInPicture();
  }
  
  // Re-enable button
  button.disabled = false;
});

// Handle when Picture-in-Picture ends
videoElement.addEventListener('leavepictureinpicture', () => {
  button.textContent = 'START';
});

// Handle when media stream ends
videoElement.addEventListener('ended', () => {
  button.textContent = 'SELECT SCREEN';
});

// Initialize
button.textContent = 'SELECT SCREEN';
