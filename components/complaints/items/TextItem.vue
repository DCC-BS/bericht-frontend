<script lang="ts" setup>
import type { ComplaintText } from '~/models/compaint_item';

const complaintItemService = useComplaintItemService();

interface Props {
    item: ComplaintText;
}

const props = defineProps<Props>();
const textArea = shallowRef<HTMLTextAreaElement>();

async function onChange() {
    complaintItemService.put(props.item);
}
</script>

<template>
    <div>
        <UTextarea v-model="props.item.text" @blur="onChange" :placeholder="$t('complaint.textPlaceholder')"
            class="w-full mt-2" :rows="3" ref="textArea">
        </UTextarea>
    </div>
</template>

<style></style>