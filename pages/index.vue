<script lang="ts" setup>
import { UButton } from '#components';
import { useReportNote } from '~/composables/reportNote';

const { createNewReportNote } = useReportNote();

async function createNewNote() {
    const note = await createNewReportNote({
        createdAt: new Date(),
    });

    navigateTo(`/notes/${note.uid}`);
}
</script>

<template>
    <UContainer class="flex justify-center mt-20">
        <UButton @click="createNewNote">Create New Note</UButton>
    </UContainer>
</template>
