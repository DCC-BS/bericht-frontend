<script lang="ts" setup>
import { UModal } from "#components";
import type { DeleteModalProps } from "~/models/delte_modal_props";

interface Props {
    options: DeleteModalProps;
}

const props = defineProps<Props>();

const { t } = useI18n();
</script>

<template>
    <UModal v-model:open="props.options.isOpen" class="p-2">
        <template #content>
            <div>
                <div class="text-center">
                    <p class="mt-4 text-gray-600">
                        {{ props.options.message }}
                    </p>
                </div>
                <div class="flex justify-center mt-4">
                    <UButton class="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                        @click="props.options.onSubmit">
                        {{ t('deleteModal.delete') }}
                    </UButton>

                    <UButton class="px-4 py-2 ml-2 text-white bg-gray-600 rounded hover:bg-gray-700"
                        @click="props.options.onCancel">
                        {{ t('deleteModal.cancel') }}
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>


<style></style>