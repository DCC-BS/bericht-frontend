<script lang="ts" setup>
import {
    ComplaintImage,
    ComplaintRecording,
    ComplaintText,
} from "~/models/compaint_item";
import type { IComplaint } from "~/models/complaint";

interface Props {
    reportId: string;
    complaint: IComplaint;
}

const props = defineProps<Props>();

// Import i18n composable
const { t } = useI18n();

// Helper to get image URL
function getBlobUrl(image: Blob): string {
    return URL.createObjectURL(image);
}
</script>

<template>
    <div class="pb-10 w-full">
        <div class="flex items-end justify-between p-1 pr-2">
            <div class="text-2xl font-bold">
                {{ t(`complaint.${props.complaint.type}`) }}
            </div>
            <ULink :to="`/notes/${props.reportId}/complaints/${props.complaint.id}`">
                <UIcon name="i-lucide-file-pen-line" class="size-6"></UIcon>
            </ULink>
        </div>

        <div v-for="item in props.complaint.items" class="mb-4">
            <div v-if="item instanceof ComplaintText" class="w-full">
                <span>{{ item.text }}</span>
            </div>

            <div v-else-if="item instanceof ComplaintImage" class="w-full">
                <img :src="getBlobUrl(item.image.image)" alt="Complaint Image"
                    class="m-auto w-auto h-auto rounded-lg shadow-md max-h-[200px]" />
            </div>
            <div v-else-if="item instanceof ComplaintRecording" class="w-full">
                <audio controls :src="getBlobUrl(item.audio)" class="m-auto" />
                <div v-if="item.text" class="mt-2">
                    <span>{{ item.text }}</span>
                </div>
            </div>
        </div>
    </div>
</template>