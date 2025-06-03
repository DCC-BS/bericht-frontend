<script lang="ts" setup>
import type { ComplaintImage } from "~/models/compaint_item";

interface Props {
    item: ComplaintImage;
    reportId: string;
    complaintId: string;
}

const props = defineProps<Props>();

const imageUrl = computed(() => {
    if (props.item?.image) {
        return URL.createObjectURL(props.item.image.image);
    }
    return "";
});

function openDrawingModal() {
    console.log(
        "Opening drawing modal for item:",
        `/notes/${props.reportId}/complaints/${props.complaintId}/draw/${props.item.id}`,
    );

    navigateTo(
        `/notes/${props.reportId}/complaints/${props.complaintId}/draw/${props.item.id}`,
    );
}
</script>

<template>
    <div>
        <div class="relative w-fit h-fit m-auto">
            <img :src="imageUrl" alt="Complaint Image" class="w-auto h-auto rounded-lg shadow-md max-h-[200px]" />
            <UButton @click="openDrawingModal" class="absolute right-1 bottom-1" size="lg" icon="i-lucide-pencil-ruler">
            </UButton>
        </div>
    </div>
</template>

<style scoped>
/* When modal is active, prevent interactions with underlying content */
:deep(.modal-open) {
    pointer-events: none;
}

/* But allow interactions within the modal itself */
:deep(.u-modal) {
    pointer-events: auto;
}
</style>