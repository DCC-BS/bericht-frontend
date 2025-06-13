<script lang="ts" setup>
import { useOnline } from "@vueuse/core";
import type { ComplaintRecording } from "~/models/compaint_item";
import type { TranscriptionResponse } from "~/models/transcription_response";
import { SpeechToTextService } from "~/services/speech_to_text.service";

interface Props {
    complaintId: string;
    item: ComplaintRecording;
}

const props = defineProps<Props>();
const { t } = useI18n();
const { updateComplaintItem } = useComplaintItemService(props.complaintId);
const stt = useService(SpeechToTextService);
const toast = useToast();
const isSttLoading = ref(false);
const isOnline = useOnline();

onMounted(() => {
    if (
        isOnline.value &&
        props.item?.audio &&
        (!props.item.text || props.item.text.length === 0)
    ) {
        speechToText(props.item.audio);
    }
});

async function speechToText(file: Blob) {
    isSttLoading.value = true;
    try {
        const text = await stt.transcribeAudio(file);
        props.item.text = text;
        onChange();
    } catch (error) {
        toast.add({
            title: t("speechToText.error"),
            icon: "i-lucide-circle-alert",
            color: "error",
        });
        console.error("Error during speech-to-text conversion:", error);
    }

    isSttLoading.value = false;
}

async function onChange() {
    updateComplaintItem(props.item);
}

const audioUrl = computed(() => {
    if (props.item?.audio) {
        return URL.createObjectURL(props.item.audio);
    }
    return "";
});
</script>

<template>
    <div>
        <audio controls v-if="audioUrl" class="m-auto">
            <source :src="audioUrl">
            {{ t('audioElement.browserNotSupported') }}
        </audio>

        <UTextarea :loading="isSttLoading" :disabled="isSttLoading" loading-icon="i-lucide-loader"
            v-model="props.item.text" @blur="onChange" :icon="isOnline ? undefined : 'i-lucide-wifi-off'"
            :placeholder="isSttLoading ? t('speechToText.converting') : t('complaint.textPlaceholder')"
            class="w-full mt-2" :rows="3">
        </UTextarea>
    </div>
</template>

<style></style>