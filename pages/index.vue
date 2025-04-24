<script lang="ts" setup>
import { UButton } from '#components';

const reportService = useReportService();

async function createNewReport() {
    const report = await reportService.createReport("new Report");
    navigateTo(`/notes/${report.id}`);
}
</script>

<template>
    <UContainer class="flex justify-center mt-20">
        <UButton @click="createNewReport">Create New report</UButton>
    </UContainer>
</template>