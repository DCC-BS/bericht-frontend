<script lang="ts" setup>
import type { TranscriptionResponse } from '~/models/transcription_response';

const emit =
    defineEmits<
        (e: 'transcription-complete', file: Blob, text: string) => void
    >();
const isProcessing = ref(false);

async function onRecordingComplete(file: Blob) {
    isProcessing.value = true;
    const formData = new FormData();
    formData.append('file', file);

    const response = await $fetch<TranscriptionResponse>('/api/stt', {
        body: formData,
        method: 'POST',
    });

    emit('transcription-complete', file, response.text);
    isProcessing.value = false;
}
</script>

<template>
    <AudioRecorder @recording-complete="onRecordingComplete" />
    <div v-if="isProcessing" class="processing-animation">
        <div class="animation-container">
            <div class="circle circle-1" />
            <div class="circle circle-2" />
            <div class="circle circle-3" />
        </div>
        <p class="processing-text">Converting speech to text...</p>
    </div>
</template>

<style scoped>
/* Processing animation styles */
.processing-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    margin-top: 16px;
}

.animation-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
}

.circle {
    width: 12px;
    height: 12px;
    background-color: #3498db;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
}

.circle-1 {
    animation-delay: -0.32s;
}

.circle-2 {
    animation-delay: -0.16s;
}

.processing-text {
    color: #555;
    font-size: 14px;
    margin-top: 8px;
}

@keyframes bounce {
    0%,
    80%,
    100% {
        transform: scale(0);
        opacity: 0.5;
    }

    40% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>
