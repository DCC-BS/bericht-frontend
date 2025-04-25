<script lang="ts" setup>
// Import i18n composable
const { t } = useI18n();

const emit = defineEmits<{
    (e: 'confirm'): void,
    (e: 'cancel'): void
}>();

let timer: NodeJS.Timeout | null = null;
const isOpen = ref(false);

watch(isOpen, (newValue) => {
    if (newValue) {
        timer = setTimeout(() => {
            isOpen.value = false;
        }, 3000);
    } else {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }
});

function onCancel(): void {
    isOpen.value = false;
    emit('cancel');
}

</script>

<template>
    <UPopover v-model:open="isOpen">
        <slot />

        <template #content>
            <div class="p-4">
                <div>{{ t('confirmButton.confirmQuestion') }}</div>
                <div class="flex justify-end mt-2">
                    <UButton variant="soft" @click="onCancel()" class="mr-2" size="lg">
                        {{ t('confirmButton.cancel') }}
                    </UButton>
                    <UButton variant="soft" color="error" @click="emit('confirm')" size="lg">
                        {{ t('confirmButton.confirm') }}
                    </UButton>
                </div>
            </div>
        </template>
    </UPopover>

</template>

<style></style>