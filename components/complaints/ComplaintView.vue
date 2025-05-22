<script lang="ts" setup>
import {
    ComplaintImage,
    ComplaintRecording,
    ComplaintText,
} from "~/models/compaint_item";
import type { IComplaint } from "~/models/complaint";

interface Props {
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
        <div class="text-2xl font-bold mb-4">
            {{ t(`complaint.${props.complaint.type}`) }}
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