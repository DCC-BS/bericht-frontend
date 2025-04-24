<script lang="ts" setup>
import { useReportNote } from '~/composables/reportNote';
import type { ReportNoteEntry } from '~/models/report_note';

const route = useRoute();
const { currentNote, setReportNoteByUid, addEntyToCurrentReportNote } =
    useReportNote();

const noteId = route.params.noteId;

// Create a state that represents a partial entry
const entryState = ref<Partial<ReportNoteEntry>>({
    audioFile: undefined,
    text: '',
    notes: '',
    images: [],
});

const entryIndex = computed(() => currentNote.value?.entries.length ?? 0);

// Validate the note ID
if (!noteId || typeof noteId !== 'string') {
    throw new Error('Note ID is required');
}

// Load the current note
onMounted(() => {
    setReportNoteByUid(noteId);
});

// Function to add the entry to the report
function addEntry(): void {
    addEntyToCurrentReportNote({
        images: entryState.value.images || [],
        text: entryState.value.text || '',
        notes: entryState.value.notes || '',
        audioFile: entryState.value.audioFile,
    });

    // Reset form after submission
    entryState.value = {
        audioFile: undefined,
        text: '',
        notes: '',
        images: [],
    };
}
</script>

<template>
    <UContainer class="pb-10">
        <h1 class="text-lg m-4 text-center">Eintrag: {{ entryIndex }} {{ currentNote?.name }}</h1>

        <!-- Use the new ReportEntryForm component with v-model -->
        <ReportEntryForm v-model="entryState" />

        <div class="flex justify-between p-2">
            <ULink :href="`/notes/${noteId}`">
                <UButton size="xl" color="secondary">Back</UButton>
            </ULink>
            <UButton size="xl" @click="addEntry">Add</UButton>
        </div>
    </UContainer>
</template>