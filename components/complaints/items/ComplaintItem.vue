<script lang="ts" setup>
import ImageItem from "~/components/complaints/items/ImageItem.vue";
import RecordingItem from "~/components/complaints/items/RecordItem.vue";
import TextItem from "~/components/complaints/items/TextItem.vue";
import type { IComplaintItem } from "~/models/compaint_item";
import {
    ComplaintImage,
    ComplaintRecording,
    ComplaintText,
} from "~/models/compaint_item";

// Define the props interface
interface Props {
    complaintId: string;
    item: IComplaintItem;
}

// Define the emits
const emit = defineEmits<{
    delete: [item: IComplaintItem];
}>();

// Constants
const SWIPE_THRESHOLD = 100; // Pixels required to trigger action
const MIN_SWIPE_THRESHOLD = 5; // Minimum swipe threshold for action

// Component state
const props = defineProps<Props>();
const cardRef = ref<HTMLElement>();
const { isSwiping, direction, lengthX } = useMouseAndTouchSwipe(cardRef);
const toast = useToast();
const isRemoving = ref(false);

const isSwipeThresholdReached = computed(() => {
    return Math.abs(lengthX.value) > SWIPE_THRESHOLD;
});
const cardStyle = ref({
    transform: "none",
    transition: "transform 0.3s ease",
});

/**
 * Delete the complaint item
 */
function deleteItem(): void {
    isRemoving.value = true;

    console.log("Deleting item:", props.item);

    // Emit the delete event to parent
    emit("delete", props.item);
}

/**
 * Reset card position with animation
 */
function resetCardPosition(): void {
    cardStyle.value = {
        transform: "none",
        transition: "transform 0.3s ease",
    };
}

// Watch swipe movement and update card position
watch(lengthX, (newX) => {
    if (isSwiping.value && Math.abs(newX) > MIN_SWIPE_THRESHOLD) {
        cardStyle.value = {
            transform: `translateX(${-newX}px)`,
            transition: "none",
        };
    } else {
        cardStyle.value = {
            transform: "none",
            transition: "transform 0.3s ease",
        };
    }
});

// Watch for swipe end to determine if threshold was reached
watch(isSwiping, (swiping) => {
    if (!swiping && lengthX.value !== 0) {
        // If not swiping anymore and was moved
        const absX = Math.abs(lengthX.value);

        if (absX > SWIPE_THRESHOLD) {
            console.log("Threshold reached:", absX, direction.value);

            // Threshold reached
            if (direction.value === "left") {
                // Delete action
                deleteItem();
            } else if (direction.value === "right") {
                deleteItem();
            }
        } else {
            // Below threshold, reset position
            resetCardPosition();
        }
    }
});
</script>

<template>
    <div class="relative overflow-x-clip">
        <!-- Card with dynamic styling based on swipe -->
        <UCard class="m-2" ref="cardRef" :style="cardStyle" :class="{ 'opacity-0': isRemoving }">
            <div v-if="props.item instanceof ComplaintText">
                <TextItem :item="props.item" :complaint-id="props.complaintId" />
            </div>
            <div v-else-if="props.item instanceof ComplaintImage">
                <ImageItem :item="props.item" />
            </div>
            <div v-else-if="props.item instanceof ComplaintRecording">
                <RecordingItem :item="props.item" :complaint-id="props.complaintId" />
            </div>
        </UCard>
        <!-- Background that's revealed when swiping -->
        <div class="absolute rounded-lg left-2 top-0 bottom-0 right-2 -z-10 flex items-center justify-between">
            <!-- Left swipe action (delete) -->
            <div class="flex-1 h-full bg-error flex items-center justify-start p-4 rounded-l-lg">
                <UIcon name="i-lucide-trash-2" class="text-white text-xl transition duration-300 ease-in-out"
                    :class="{ 'scale-150': isSwipeThresholdReached, 'scale-100': !isSwipeThresholdReached }" />
            </div>
            <!-- Right swipe action (archive) -->
            <div class="flex-1 h-full bg-error flex items-center justify-end p-4 rounded-r-lg">
                <UIcon name="i-lucide-trash-2" class="text-white text-xl transition duration-300 ease-in-out"
                    :class="{ 'scale-150': isSwipeThresholdReached, 'scale-100': !isSwipeThresholdReached }" />
            </div>
        </div>
    </div>
</template>


<style>
/* Animation for when the card is being removed */
.opacity-0 {
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.5s ease;
    transform: translateX(-100%);
}
</style>