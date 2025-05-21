<script lang="ts" setup>
import type { ComplaintRecording } from '~/models/compaint_item';
import type { TranscriptionResponse } from '~/models/transcription_response';

interface Props {
    item: ComplaintRecording;
}

const props = defineProps<Props>();
const { t } = useI18n();
const complaintItemService = useComplaintItemService();
const toast = useToast();
const isSttLoading = ref(false);

onMounted(() => {
    if (props.item?.audio && (!props.item.text || props.item.text.length === 0)) {
        speechToText(props.item.audio)
    }
});

async function speechToText(file: Blob) {
    isSttLoading.value = true;
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await $fetch<TranscriptionResponse>('/api/stt', {
            body: formData,
            method: 'POST',
        });

        props.item.text = response.text;
    } catch (error) {
        toast.add({
            title: t('speechToText.error'),
            icon: 'i-heroicons-exclamation-circle',
            color: 'error',
        });
        console.error('Error during speech-to-text conversion:', error);
    }

    isSttLoading.value = false;
}

async function onChange() {
    complaintItemService.put(props.item);
}

const audioUrl = computed(() => {
    if (props.item?.audio) {
        return URL.createObjectURL(props.item.audio);
    }
    return '';
});

</script>

<template>
    <div>
        <audio controls v-if="audioUrl" class="m-auto">
            <source :src="audioUrl">
            Your browser does not support the audio element.
        </audio>

        <UTextarea :loading="isSttLoading" :disabled="isSttLoading" loading-icon="i-lucide-loader"
            v-model="props.item.text" @blur="onChange"
            :placeholder="isSttLoading ? t('speechToText.converting') : t('complaint.textPlaceholder')"
            class="w-full mt-2" :rows="3">
        </UTextarea>
    </div>
</template>

<style></style>