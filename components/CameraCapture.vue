<script lang="ts" setup>
import { ref, onMounted } from 'vue';

// State variables
const isMobile = ref(false);
const showCamera = ref(false);
const capturedImage = ref<string>();
const capturedBlob = ref<Blob | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
// Track which camera is active (true = front camera, false = back camera)
const usingFrontCamera = ref(false);
// Store the current camera stream to easily switch cameras
const currentStream = ref<MediaStream | null>(null);
// Add loading state to prevent multiple camera switches at once
const isSwitchingCamera = ref(false);

// Detect if the device is mobile
onMounted(() => {
    // Check if the device is mobile using userAgent
    isMobile.value =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
        );
});

// Open camera or file dialog based on device type
const capturePhoto = () => {
    if (isMobile.value) {
        showCamera.value = true;
        // Access camera on mobile devices with specific camera preference
        startCamera();
    } else {
        // Trigger file upload dialog on desktop
        if (fileInput.value) {
            fileInput.value.click();
        }
    }
};

// Start camera with current camera settings
const startCamera = () => {
    // Set the camera facing mode based on the selected camera
    const facingMode = usingFrontCamera.value ? 'user' : 'environment';

    // Set loading state to prevent multiple attempts
    isSwitchingCamera.value = true;

    // Properly stop any existing stream before starting a new one
    if (currentStream.value) {
        const tracks = currentStream.value.getTracks();
        tracks.forEach((track) => track.stop());
        currentStream.value = null;
    }

    // Clear video source before requesting new stream
    const videoElement = document.getElementById(
        'camera-preview',
    ) as HTMLVideoElement;
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject = null;
    }

    // Access camera with specified constraints
    navigator.mediaDevices
        .getUserMedia({
            video: {
                facingMode: facingMode,
            },
        })
        .then((stream) => {
            currentStream.value = stream;

            // Make sure the video element still exists (user might have navigated away)
            const videoElement = document.getElementById(
                'camera-preview',
            ) as HTMLVideoElement;
            if (videoElement) {
                videoElement.srcObject = stream;
                videoElement
                    .play()
                    .then(() => {
                        // Camera started successfully
                        isSwitchingCamera.value = false;
                    })
                    .catch((err) => {
                        console.error('Error playing video stream:', err);
                        isSwitchingCamera.value = false;
                    });
            } else {
                // Clean up if video element is gone
                stopCameraStream();
                isSwitchingCamera.value = false;
            }
        })
        .catch((err) => {
            console.error('Error accessing camera:', err);
            // If back camera fails, try falling back to any available camera
            if (!usingFrontCamera.value) {
                console.log('Falling back to front camera');
                usingFrontCamera.value = true;
                isSwitchingCamera.value = false;
                startCamera();
            } else {
                alert('Could not access camera. Please check permissions.');
                isSwitchingCamera.value = false;
                showCamera.value = false;
            }
        });
};

// Toggle between front and back cameras
const toggleCamera = () => {
    // Prevent multiple simultaneous camera switches
    if (isSwitchingCamera.value) return;

    // Switch the camera preference
    usingFrontCamera.value = !usingFrontCamera.value;

    // Restart camera with new setting
    startCamera();
};

// Handle file upload for desktop
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            capturedImage.value = e.target?.result as string;
        };
        reader.readAsDataURL(target.files[0]);
    }
};

// Take photo from video stream on mobile
const takePhoto = () => {
    const video = document.getElementById('camera-preview') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
        .getContext('2d')
        ?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to data URL
    canvas.toBlob((blob) => {
        capturedBlob.value = blob;
    }, 'image/jpeg');
    capturedImage.value = canvas.toDataURL('image/jpeg');

    // Stop camera stream
    stopCameraStream();
};

// Stop camera stream
const stopCameraStream = () => {
    // Only attempt to stop if there's an active stream
    if (currentStream.value) {
        const tracks = currentStream.value.getTracks();
        tracks.forEach((track) => track.stop());
        currentStream.value = null;
    }

    // Also clear the video element source
    const video = document.getElementById('camera-preview') as HTMLVideoElement;
    if (video && video.srcObject) {
        video.srcObject = null;
    }

    showCamera.value = false;
};

// Retake photo function
const retakePhoto = () => {
    capturedImage.value = undefined;
    capturePhoto();
};

// Submit photo to parent component
const submitPhoto = () => {
    if (capturedBlob.value) {
        // Emit event with captured image to parent component
        emit('photo-captured', capturedBlob.value);
    }
    capturedImage.value = undefined;
};

// Define emits
const emit = defineEmits<(e: 'photo-captured', data: Blob) => void>();
</script>

<template>
    <div class="camera-capture-container">
        <!-- Show camera view or upload button based on state -->
        <div v-if="!capturedImage" class="capture-section">
            <!-- Camera view on mobile devices -->
            <div v-if="showCamera" class="camera-view">
                <video id="camera-preview" autoplay playsinline />
                <button class="capture-button" @click="takePhoto">
                    Take Photo
                </button>
                <!-- Add camera toggle button with loading state -->
                <button class="switch-camera-button" :disabled="isSwitchingCamera" @click="toggleCamera">
                    {{
                        isSwitchingCamera
                            ? 'Switching...'
                            : `Switch Camera (${usingFrontCamera ? 'Front' : 'Back'})`
                    }}
                </button>
                <!-- Add loading indicator when switching cameras -->
                <div v-if="isSwitchingCamera" class="camera-loading">
                    Switching camera...
                </div>
            </div>

            <!-- Capture/upload button when no camera is shown -->
            <button v-else class="start-button" @click="capturePhoto">
                {{ isMobile ? 'Take a Photo' : 'Upload a Photo' }}
            </button>

            <!-- Hidden file input for desktop -->
            <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileUpload">
        </div>

        <!-- Preview captured image -->
        <div v-else class="preview-section">
            <img :src="capturedImage" alt="Captured" class="preview-image">

            <div class="action-buttons">
                <button class="retake-button" @click="retakePhoto">
                    Retake
                </button>
                <button class="submit-button" @click="submitPhoto">
                    Submit
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Container styles */
.camera-capture-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 100%;
    margin: 1rem auto;
}

/* Camera view styles */
.camera-view {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin-bottom: 1rem;
}

#camera-preview {
    width: 100%;
    border-radius: 8px;
}

/* Button styles */
.start-button,
.capture-button,
.retake-button,
.submit-button,
.switch-camera-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    margin: 0.5rem;
}

.start-button {
    background-color: #3498db;
    color: white;
    border: none;
    font-size: 1rem;
}

.capture-button {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #e74c3c;
    color: white;
    border: none;
}

/* Camera toggle button */
.switch-camera-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 0.5rem;
    font-size: 0.8rem;
    border-radius: 4px;
    z-index: 10;
}

/* Style for disabled state when switching cameras */
.switch-camera-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Camera loading indicator */
.camera-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 20;
}

.action-buttons {
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-top: 1rem;
}

.retake-button {
    background-color: #95a5a6;
    color: white;
    border: none;
}

.submit-button {
    background-color: #2ecc71;
    color: white;
    border: none;
}

/* Preview image styles */
.preview-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.preview-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    margin-bottom: 1rem;
}
</style>
