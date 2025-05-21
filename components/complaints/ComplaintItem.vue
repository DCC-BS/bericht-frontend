<script lang="ts" setup>
import type { IComplaintItem } from '~/models/compaint_item';
import { ComplaintImage, ComplaintRecording, ComplaintText } from '~/models/compaint_item';
import ImageItem from '~/components/complaints/ImageItem.vue';
import RecordingItem from '~/components/complaints/RecordItem.vue';
import TextItem from '~/components/complaints/TextItem.vue';
import type { UCard } from '#components';
import { useSwipe, useVibrate } from '@vueuse/core';

// Define the props interface
interface Props {
    item: IComplaintItem;
}

// Define the emits
const emit = defineEmits<{
    'delete': [item: IComplaintItem];
}>();

// Constants
const SWIPE_THRESHOLD = 100; // Pixels required to trigger action

// Component state
const props = defineProps<Props>();
const cardRef = ref<HTMLElement>();
const { isSwiping, direction, lengthX } = useSwipe(cardRef);
const { vibrate } = useVibrate();
const toast = useToast();
const isRemoving = ref(false);
const cardStyle = ref({
    transform: 'none',
    transition: 'transform 0.3s ease'
});

/**
 * Delete the complaint item
 */
function deleteItem(): void {
    isRemoving.value = true;
    vibrate(200);
    // Emit the delete event to parent
    emit('delete', props.item);

    toast.add({
        title: 'Item deleted',
        icon: 'i-lucide-trash-2',
        color: 'error',
    });
}

/**
 * Reset card position with animation
 */
function resetCardPosition(): void {
    cardStyle.value = {
        transform: 'none',
        transition: 'transform 0.3s ease'
    };
}

// Watch swipe movement and update card position
watch(lengthX, (newX) => {
    if (isSwiping.value) {
        cardStyle.value = {
            transform: `translateX(${-newX}px)`,
            transition: 'none'
        };
    }
});

// Watch for swipe end to determine if threshold was reached
watch(isSwiping, (swiping) => {
    if (!swiping && lengthX.value !== 0) {
        // If not swiping anymore and was moved
        const absX = Math.abs(lengthX.value);

        if (absX > SWIPE_THRESHOLD) {
            // Threshold reached
            if (direction.value === 'left') {
                // Delete action
                deleteItem();
            } else if (direction.value === 'right') {
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
                <TextItem :item="props.item" />
            </div>
            <div v-else-if="props.item instanceof ComplaintImage">
                <ImageItem :item="props.item" />
            </div>
            <div v-else-if="props.item instanceof ComplaintRecording">
                <RecordingItem :item="props.item" />
            </div>
        </UCard>
        <!-- Background that's revealed when swiping -->
        <div class="absolute rounded-lg left-2 top-0 bottom-0 right-2 -z-10 flex items-center justify-between">
            <!-- Left swipe action (delete) -->
            <div class="flex-1 h-full bg-error flex items-center justify-start p-4 rounded-l-lg">
                <UIcon name="i-lucide-trash-2" class="text-white text-xl" />
            </div>
            <!-- Right swipe action (archive) -->
            <div class="flex-1 h-full bg-error flex items-center justify-end p-4 rounded-r-lg">
                <UIcon name="i-lucide-trash-2" class="text-white text-xl" />
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