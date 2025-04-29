<script lang="ts" setup>
import { UButton, UIcon } from '#components';
import type { IReport } from '~/models/report';

const reportService = useReportService();
const { t } = useI18n();
const isCreatingReport = ref(false);

const reports = ref<IReport[]>([]);

onMounted(() => {
    reportService.getAllReports().then((data) => {
        reports.value = data;        
    }).catch((error) => {
        console.error('Error fetching reports:', error);
    });
});

async function createNewReport(): Promise<void> {
    if(isCreatingReport.value){
        return;
    }

    isCreatingReport.value = true;
    const report = await reportService.createReport("new Report");
    navigateTo(`/notes/${report.id}`);
    isCreatingReport.value = false;
}

function openReport(id: string): void {
    navigateTo(`/notes/${id}`);
}

async function deleteReport(id: string): Promise<void> {
    await reportService.deleteReport(id);
    reports.value = reports.value.filter((report) => report.id !== id);
}
</script>

<template>
    <UContainer class="flex justify-center mt-20">
        <div v-if="!isCreatingReport">
            <UButton @click="createNewReport">{{ t('home.createNewReport') }}</UButton>

            <ReportsTable :reports="reports" @view-report="openReport" @delete-report="deleteReport" />            
        </div>
        <div v-else class="flex flex-col items-center">
            <!-- Loading spinner animation using UIcon -->
            <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary" />
            <p class="mt-4 text-gray-600">{{ t('home.creatingReport') }}</p>
        </div>
    </UContainer>
</template>