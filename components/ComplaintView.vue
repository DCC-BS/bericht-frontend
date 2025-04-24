<script lang="ts" setup>
import type { ReportNoteEntry } from '~/models/report_note';

interface inputProps {
    entry: ReportNoteEntry
}

const props = defineProps<inputProps>();

// Function to handle the captured photo
function handlePhotoCaptured(photoData: Blob): void {
    if (!props.entry) {
        return;
    }

    const newImages = [...(props.entry.images || []), photoData];
    props.entry.images = newImages;
}

// Function to handle transcription completion
function onTranscriptionComplete(file: Blob, text: string): void {
    if (!props.entry) {
        return;
    }

    props.entry.audioFile = file;
    props.entry.text = text;
}

// Helper to get image URL
function getImageUrl(image: Blob): string {
    return URL.createObjectURL(image);
}

// Function to remove an image
function removeImage(index: number): void {
    if (!props.entry) {
        return;
    }

    const newImages = [...(props.entry.images || [])];
    newImages.splice(index, 1);
    props.entry.images = newImages;
}
</script>

<template>
    <UContainer class="pb-10">
        <!-- Speech to text component -->
        <SpeechToText @transcription-complete="onTranscriptionComplete" />

        <!-- Text input area -->
        <div v-if="entry" class="p-2">
            <UTextarea class="w-full" v-model="entry.text" />
        </div>

        <!-- Camera capture component -->
        <CameraCapture @photo-captured="handlePhotoCaptured" />

        <!-- Image preview section -->
        <div v-if="entry?.images && entry.images.length > 0">
            <h3>Captured Images:</h3>
            <div class="flex flex-wrap">
                <div v-for="(image, index) in entry.images" :key="index" class="image-container">
                    <img :src="getImageUrl(image)" alt="Captured Image">
                    <UButton @click="removeImage(index)">Remove</UButton>
                </div>
            </div>
        </div>
        <div v-else>
            <p>No images captured yet.</p>
        </div>
    </UContainer>
</template>