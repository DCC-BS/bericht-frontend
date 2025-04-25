<script lang="ts" setup>
import { UButton, UIcon } from '#components';

const reportService = useReportService();
const { t } = useI18n();
const isCreatingReport = ref(false);

async function createNewReport(): Promise<void> {
    isCreatingReport.value = true;
    const report = await reportService.createReport("new Report");
    navigateTo(`/notes/${report.id}`);
    isCreatingReport.value = false;
}
</script>

<template>
    <UContainer class="flex justify-center mt-20">
        <div v-if="!isCreatingReport">
            <UButton @click="createNewReport">{{ t('home.createNewReport') }}</UButton>
        </div>
        <div v-else class="flex flex-col items-center">
            <!-- Loading spinner animation using UIcon -->
            <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary" />
            <p class="mt-4 text-gray-600">{{ t('home.creatingReport') }}</p>
        </div>
    </UContainer>
</template>