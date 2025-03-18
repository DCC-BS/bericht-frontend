<script lang="ts" setup>
// Function to handle the captured photo
const handlePhotoCaptured = (photoData: string) => {
    console.log('Photo received from CameraCapture component:', photoData);
    // Process the captured photo data here
};
</script>

<template>
    <SpeechToText />
    <!-- Add the new CameraCapture component -->
    <CameraCapture @photo-captured="handlePhotoCaptured" />
</template>