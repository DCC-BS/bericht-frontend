<script lang="ts" setup>
import type { ComplaintImage } from '~/models/compaint_item';


interface Props {
    item: ComplaintImage;
}

const props = defineProps<Props>();

const imageUrl = computed(() => {
    if (props.item?.image) {
        return URL.createObjectURL(props.item.image.image);
    }
    return '';
});
</script>

<template>
    <div>
        <img :src="imageUrl" alt="Complaint Image" class="m-auto w-auto h-auto rounded-lg shadow-md max-h-[200px]" />
    </div>
</template>

<style></style>