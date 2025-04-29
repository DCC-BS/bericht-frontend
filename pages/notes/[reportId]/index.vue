<script lang="ts" setup>
import type { IReport } from '~/models/report';
import ComplaintView from '../../../components/ComplaintView.vue';
import { createComplaint } from '~/models/complaint';
import Draggable from 'vuedraggable';

const route = useRoute();
const toast = useToast();
const reportService = useReportService();
const logger = useLogger();
const { t } = useI18n();

const reportId = route.params.reportId;
const currentReport = ref<IReport>();

if (!reportId || typeof reportId !== 'string') {
    throw new Error('Report ID is required');
}

onMounted(() => {
    reportService.getReport(reportId).then((report) => {
        if (!report) {
            toast.add({
                title: t('report.notFound'),
                icon: 'i-heroicons-exclamation-circle',
                color: 'error',
            });
        }

        currentReport.value = report;

        if(currentReport.value?.complaints.length === 0) {
            currentReport.value.addComplaint(createComplaint({}));
        }
    });
});

watch(currentReport, (newValue) => {
    if (newValue) {        
        reportService.updateReport(newValue);
    }
}, { deep: true });

function onAddClicked(): void {
    if(!currentReport.value) {
        logger.error('Report not found');
        return;
    }	

    currentReport.value.addComplaint(createComplaint({}));
}

function saveReport(): void {
    if(!currentReport.value) {
        logger.error('Report not found');
        return;
    }

    reportService.updateReport(currentReport.value);
    toast.add({
        title: t('report.saved'),
        icon: 'i-heroicons-check-circle',
        color: 'success',
    });
}

function removeComplaint(id: string): void {
    if(!currentReport.value) {
        logger.error('Report not found');
        return;
    }

    currentReport.value.removeComplaint(id);
    saveReport();
}

async function sendEmaol() {
    sendEmail()
}

async function exportReport(){
    if(!currentReport.value) {
        logger.error('Report not found');
        return;
    }

    await reportService.generateTitles(currentReport.value);

    const report = toRaw(currentReport.value);
    const blob = await createDoxf(report);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReport.value?.name}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.add({
        title: t('report.exported'),
        icon: 'i-heroicons-check-circle',
        color: 'success'});
}
</script>

<template>
    <div v-if="currentReport" class="text-center p-1">
        <div class="bg-gray-400 p-1">
            <h1 class="text-xl font-bold mb-2">
                <UInput v-model="currentReport.name" class="w-full" @blur="saveReport"></UInput>
            </h1>
            <div class="grid grid-cols-2">
                <div class="text-left font-bold">{{ t('report.customer') }}</div>
                <UInput v-model="currentReport.customer" class="w-full" @blur="saveReport"></UInput>

                <div class="text-left font-bold">{{ t('report.createdAt') }}</div>
                <div class="text-left">{{ currentReport.createdAt.toLocaleDateString('de-CH') }}</div>
                <div class="text-left font-bold">{{ t('report.updateAt') }}</div>
                <div class="text-left">{{ currentReport.lastModified.toLocaleDateString('de-CH') }}</div>
            </div>            
        </div>

        <div class="flex flex-col justify-center">
            <div v-if="currentReport.complaints.length === 0" class="text-center py-8">
                <p>{{ t('report.noComplaints') }}</p>
            </div>
            
            <Draggable
                v-else
                :list="currentReport.complaints as unknown[]"
                handle=".drag-handle"
                item-key="id"
            >
                <template #item="{ index }">
                    <div class="border-2 border-gray-300 rounded-lg my-2">
                        <div class="flex items-stretch align-imddle justify-stretch self-stretch">
                            <div class="bg-gray-100 drag-handle w-[50px]">
                                <UIcon
                                    name="i-heroicons-bars-3"
                                    size="26"
                                />
                            </div>
                            <div class="w-full">
                                <ComplaintView v-model="currentReport.complaints[index]" @on-save="saveReport" />
                            </div>
                        </div>
                        <div class="bg-gray-100 w-ful flex items-center justify-center p-2">
                                <ConfirmButton @confirm="removeComplaint(currentReport.complaints[index].id)">
                                    <UIcon
                                        name="i-heroicons-trash"
                                        size="26"
                                        class="cursor-pointer text-red-500"
                                    />
                                </ConfirmButton>
                            </div>
                    </div>
                </template>
            </Draggable>

            <div class="flex flex-col gap-2">
                <div class="m-auto w-2/3">
                    <UButton @click="onAddClicked" class="w-full flex items-center justify-center gap-2" icon="i-heroicons-plus-circle">
                        {{ t('report.addComplaint') }}
                    </UButton>
                </div>

                <EmailExport :report="currentReport"/>
            </div>
        </div>
    </div>
    <div v-else class="flex justify-center items-center h-screen">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary" />
        <p class="ml-4">{{ t('report.loading') }}</p>
    </div>
</template>