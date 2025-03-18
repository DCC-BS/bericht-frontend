<script lang="ts" setup>
import type { TranscriptionResponse } from '~/models/transcription_response';

const text = ref<string>();

async function onRecordingComplete(file: Blob) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await $fetch<TranscriptionResponse>('/api/stt', {
        body: formData,
        method: 'POST',
    });

    text.value = response.text;
}
</script>

<template>
    <AudioRecorder @recording-complete="onRecordingComplete" />
    <div v-if="text">
        <p>{{ text }}</p>
    </div>
</template>