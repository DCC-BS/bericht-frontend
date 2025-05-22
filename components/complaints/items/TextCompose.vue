<script lang="ts" setup>
import type { UTextarea } from '#components';

const emit = defineEmits<{
    (e: 'text-composed', text: string): void
}>();

const { t } = useI18n();
const text = ref<string>('');

function onSubmit() {
    if (text.value) {
        emit('text-composed', text.value);
        text.value = '';
    }
}
</script>

<template>
  <div class="flex flex-col gap-2">
      <UTextarea v-model="text" class="w-full mt-2" :rows="5" autofocus autoresize size="xl">
      </UTextarea>
      <UButton @click="onSubmit" class="m-auto" variant="soft" color="neutral" size="lg" icon="i-lucide-plus"
          :label="t('complaintItem.addText')" />
  </div>
</template>

<style>

</style>