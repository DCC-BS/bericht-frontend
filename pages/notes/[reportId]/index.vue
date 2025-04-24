<script lang="ts" setup>
import type { IReport } from '~/models/report';
import ComplaintView from '../../../components/ComplaintView.vue';
import { createComplaint } from '~/models/complaint';
import Draggable from 'vuedraggable';

const route = useRoute();
const toast = useToast();
const reportService = useReportService();
const logger = useLogger();

const reportId = route.params.reportId;
const currentReport = ref<IReport>();

if (!reportId || typeof reportId !== 'string') {
    throw new Error('Report ID is required');
}

onMounted(() => {
    reportService.getReport(reportId).then((report) => {
        if (!report) {
            toast.add({
                title: 'Report not found',
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

function onAddClicked(){
    if(!currentReport.value) {
        logger.error('Report not found');
        return;
    }	

    currentReport.value.addComplaint(createComplaint({}));
}
</script>

<template>
    <div v-if="currentReport">
        <h1>{{ currentReport.name }}</h1>
        <p>Created at {{ currentReport.createdAt }}</p>
        <p>Updated at {{ currentReport.lastModified }}</p>

        <div class="flex flex-col justify-center">
            <Draggable
                :list="currentReport.complaints"
                handle=".drag-handle"
                item-key="id"    
            >
                <template #item="{ element }">
                    <div class="flex items-stretch align-middle justify-stretch self-stretch border-2 border-gray-300 rounded-lg m-2">
                        <div class="bg-gray-100 drag-handle w-[50px]">
                            <UIcon
                                name="i-heroicons-bars-3"
                                size="26"
                            />
                        </div>
                        <ComplaintView :entry="element" />
                    </div>
                </template>
            </Draggable>

            <div class="m-auto">
                <UButton @click="onAddClicked" icon="i-heroicons-plus-circle">
                </UButton>
            </div>
        </div>
    </div> 
    <div v-else>
        <p>Loading...</p>
    </div>
</template>