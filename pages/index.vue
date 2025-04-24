<script lang="ts" setup>
import { UButton } from '#components';

const reportService = useReportService();

async function createNewNote() {
    const note = await reportService.createReport("new Report");
    navigateTo(`/notes/${note.id}`);
}
</script>

<template>
    <UContainer class="flex justify-center mt-20">
        <UButton @click="createNewNote">Create New Note</UButton>
    </UContainer>
</template>