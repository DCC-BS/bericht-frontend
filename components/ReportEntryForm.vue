<script lang="ts" setup>
import type { ReportNoteEntry } from '~/models/report_note';

const model = defineModel<Partial<ReportNoteEntry>>();

// Function to handle the captured photo
function handlePhotoCaptured(photoData: Blob): void {
    if (!model.value) {
        return;
    }

    const newImages = [...(model.value.images || []), photoData];
    model.value.images = newImages;
}

// Function to handle transcription completion
function onTranscriptionComplete(file: Blob, text: string): void {
    if (!model.value) {
        return;
    }

    model.value.audioFile = file;
    model.value.text = text;
}

// Function to remove an image
function removeImage(index: number): void {
    if (!model.value) {
        return;
    }

    const newImages = [...(model.value.images || [])];
    newImages.splice(index, 1);
    model.value.images = newImages;
}

// Helper to get image URL
function getImageUrl(image: Blob): string {
    return URL.createObjectURL(image);
}
</script>

<template>
    <div class="report-entry-form">
        <!-- Speech to text component -->
        <SpeechToText @transcription-complete="onTranscriptionComplete" />

        <!-- Camera capture component -->
        <CameraCapture @photo-captured="handlePhotoCaptured" />

        <!-- Text input area -->
        <div v-if="model" class="form-field">
            <label for="entry-text">Text</label>
            <UTextarea id="entry-text" v-model="model.text" />
        </div>

        <!-- Notes input area -->
        <div v-if="model" class="form-field">
            <label for="entry-notes">Notes</label>
            <UTextarea id="entry-notes" v-model="model.notes" />
        </div>

        <!-- Image preview section -->
        <div v-if="model?.images && model.images.length > 0" class="images-preview">
            <h3>Captured Images:</h3>
            <div v-for="(image, index) in model.images" :key="index" class="image-container">
                <img :src="getImageUrl(image)" alt="Captured Image">
                <UButton @click="removeImage(index)">Remove</UButton>
            </div>
        </div>
        <div v-else>
            <p>No images captured yet.</p>
        </div>
    </div>
</template>

<style scoped>
.report-entry-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.images-preview {
    margin-top: 1rem;
}

.image-container {
    margin-bottom: 1rem;
}

.image-container img {
    max-width: 100%;
    max-height: 200px;
    margin-bottom: 0.5rem;
}
</style>
