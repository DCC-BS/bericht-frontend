<script lang="ts" setup>
import { isTemplateExpression } from "typescript";
import type { ComplaintImage } from "~/models/compaint_item";

interface Props {
    item: ComplaintImage;
}

const props = defineProps<Props>();
const { updateComplaintItem } = useComplaintItemService(props.item.id);

const isDrawing = ref(false);

const imageUrl = computed(() => {
    if (props.item?.image) {
        return URL.createObjectURL(props.item.image.image);
    }
    return "";
});

/**
 * Opens the drawing modal
 */
function openDrawingModal() {
    isDrawing.value = true;
}

async function saveDrawing(image: Blob): Promise<void> {
    isDrawing.value = false;

    props.item.image.image = image;
    await updateComplaintItem(props.item);
}

async function closeDrawingModal(): Promise<void> {
    isDrawing.value = false;
}
</script>

<template>
    <UModal v-bind:open="isDrawing" fullscreen>
        <template #content>
            <div>
                <ImageDraw :src="imageUrl" @save="saveDrawing" @cancel="closeDrawingModal" />
            </div>
        </template>
    </UModal>

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