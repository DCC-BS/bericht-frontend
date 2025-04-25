<script lang="ts" setup>
import type { ComplaintDto, IComplaint } from '~/models/complaint';

// Import i18n composable
const { t } = useI18n();

// input (two way binding)
const model = defineModel<IComplaint>({
    required: true,
});

// output
const emit = defineEmits<(e: 'onSave') => void>();

// composables
const logger = useLogger();

// refs
const complaint = ref<IComplaint>(model.value);
const isDirty = ref(false);

// listeners
watch(model, (newValue) => {
    if (model.value !== newValue) {
        complaint.value = newValue;
        isDirty.value = false;
    }
});

watch(complaint, () => {
    isDirty.value = true;
}, { deep: true });

// Function to handle the captured photo
function handlePhotoCaptured(photoData: Blob): void {
    logger.info('Photo captured:', photoData);

    if (!complaint.value) {
        logger.error('Complaint not found');
        return;
    }

    complaint.value.addImage(photoData);
    emit('onSave');
}

// Function to handle transcription completion
function onTranscriptionComplete(file: Blob, text: string): void {
    if (!complaint.value) {
        logger.error('Complaint not found');
        return;
    }

    complaint.value.addMemo({
        audio: file,
        text: text
    });

    emit('onSave');
}

// Helper to get image URL
function getImageUrl(image: Blob): string {
    return URL.createObjectURL(image);
}

function removeMemo(index: number): void {
    if (!complaint.value) {
        logger.error('Complaint not found');
        return;
    }

    complaint.value.removeMemo(index);
    emit('onSave');
}

// Function to remove an image
function removeImage(index: number): void {
    if (!complaint.value) {
        logger.error('Complaint not found');
        return;
    }

    complaint.value.removeImage(index);
    emit('onSave');
}

function audioUrl(audio: Blob): string {
    return URL.createObjectURL(audio);
}

function onSave(): void {
    if (isDirty.value) {
        emit('onSave');
        isDirty.value = false;
    }
}
</script>

<template>
    <UContainer class="pb-10">
        <!-- Speech to text component -->
        <SpeechToText @transcription-complete="onTranscriptionComplete" />

        <!-- Text input area -->
        <div v-if="complaint" class="p-2 flex flex-col gap-2">
            <div v-for="(memo, index) in complaint.memos" :key="index"
                class="flex flex-col gap-2 justify-stretch border-2 border-gray-200 rounded-2xl p-2">
                <UTextarea v-model="memo.text" @blur="onSave" />
                <audio :src="audioUrl(memo.audio)" controls class="w-full"></audio>
                <ConfirmButton @confirm="removeMemo(index)">
                    <UButton class="w-full flex items-center justify-center gap-2"
                        icon="i-heroicons-trash" color="error">
                        {{ t('complaint.removeMemo') }}
                    </UButton>
                </ConfirmButton>

            </div>
        </div>

        <!-- Camera capture component -->
        <CameraCapture @photo-captured="handlePhotoCaptured" />

        <!-- Image preview section -->
        <div v-if="complaint?.images && complaint.images.length > 0">
            <h3>{{ t('complaint.capturedImages') }}</h3>
            <div class="flex flex-wrap gap-2 justify-between">
                <div v-for="(image, index) in complaint.images" :key="index" class="image-container w-[45%]">
                    <img :src="getImageUrl(image.image)" :alt="t('camera.capturedImageAlt')">
                    <ConfirmButton @confirm="removeImage(index)">
                        <UButton class="w-full flex items-center justify-center gap-2"
                            icon="i-heroicons-trash" color="error">
                            {{ t('complaint.removeImage') }}
                        </UButton>
                    </ConfirmButton>
                </div>
            </div>
        </div>
        <div v-else>
            <p>{{ t('complaint.noImages') }}</p>
        </div>
    </UContainer>
</template>