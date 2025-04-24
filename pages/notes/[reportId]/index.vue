<script lang="ts" setup>
import type { IReport } from '~/models/report';

const route = useRoute();
const toast = useToast();
const reportService = useReportService();

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
    });
});
</script>

<template>

</template>
