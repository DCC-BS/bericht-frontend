<script lang="ts" setup>
import type { ReportNoteEntry } from '~/models/report_note';

const route = useRoute();
const noteId = route.params.noteId;
if (!noteId || typeof noteId !== 'string') {
    throw new Error('Note ID is required');
}

const entryId = route.params.entryId;
if (!entryId || typeof entryId !== 'string') {
    throw new Error('Entry ID is required');
}

const { updateEntry, setReportNoteByUid, getEntyByUid } = useReportNote();
const toast = useToast();

const entry = ref<ReportNoteEntry>();

onMounted(() => {
    setReportNoteByUid(noteId).then(() => {
        entry.value = getEntyByUid(entryId);
    });
});

function saveEntry(): void {
    if (!entry.value) {
        return;
    }

    updateEntry(entry.value);
    toast.add({
        title: 'Entry saved',
        icon: 'i-heroicons-information-circle',
        color: 'success',
    });
}

</script>

<template>
    <UContainer class="pb-10">
        <h1 class="text-lg m-4 text-center">Edit Entry: {{ entryId }}</h1>
        <ReportEntryForm v-model="entry" />

        <div class="flex justify-between p-2">
            <ULink :href="`/notes/${noteId}`">
                <UButton size="xl" color="secondary">Back</UButton>
            </ULink>
            <UButton @click="saveEntry">Save</UButton>
        </div>
    </UContainer>
</template>