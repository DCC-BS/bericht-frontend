<script lang="ts" setup>
import { format } from 'date-fns';
import type { TableColumn } from '@nuxt/ui';
import type { ReportNoteEntry } from '~/models/report_note';
import { useReportNote } from '~/composables/reportNote';

const route = useRoute();
const { currentNote, setReportNoteByUid, deleteEntry } = useReportNote();
const toast = useToast();
const viewport = useViewport();

const noteId = route.params.noteId;

if (!noteId || typeof noteId !== 'string') {
    throw new Error('Note ID is required');
}

const table = useTemplateRef('table');


onMounted(() => {
    setReportNoteByUid(noteId);
});

// Define table columns
const columns: TableColumn<ReportNoteEntry>[] = [
    {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        // Format the date for display
        cell: ({ row }) =>
            format(new Date(row.getValue('timestamp')), 'yyyy-MM-dd HH:mm:ss'),
    },
    {
        accessorKey: 'notes',
        header: 'Notes',
    },
    {
        accessorKey: 'text',
        header: 'Text',
    },
    {
        accessorKey: 'hasAudio',
        header: 'Audio',
        cell: ({ row }) => (row.getValue('hasAudio') ? 'Yes' : 'No'),
    },
    {
        accessorKey: 'images',
        header: 'Images',
        cell: ({ row }) => {
            const images = row.getValue('images') as Blob[];
            const len = images?.length ?? 0;
            return len > 0 ? `${len} image(s)` : 'No images';
        },
    },
    {
        id: 'actions',
        header: 'Actions',
    },
];

watch(viewport.breakpoint, () => {
    if (viewport.isLessOrEquals('tablet')) {
        const cols = table.value?.tableApi.getAllColumns() ?? [];
        // for all cols expect frist and lasta
        for (let i = 1; i < cols.length - 1; i++) {
            cols[i].toggleVisibility(false);
        }
    } else {
        table.value?.tableApi.resetColumnVisibility();
    }
}, { immediate: true });

onMounted(() => {
    if (viewport.isLessOrEquals('tablet')) {
        const cols = table.value?.tableApi.getAllColumns() ?? [];
        // for all cols expect frist and lasta
        for (let i = 1; i < cols.length - 1; i++) {
            cols[i].toggleVisibility(false);
        }
    }
});

function onDeleteEntry(uid: string): void {
    deleteEntry(uid);
    toast.add({
        title: 'Entry deleted',
        icon: 'i-heroicons-information-circle',
        color: 'success',
    });
}
</script>

<template>
    <UContainer class="report-note-table">
        <h1 v-if="currentNote">{{ currentNote.name }}</h1>
        <p v-if="currentNote">
            Created: {{ format(new Date(currentNote.createdAt), 'yyyy-MM-dd') }}
        </p>

        <UTable v-if="currentNote" :columns="columns" :data="currentNote.entries" ref="table">
            <template #actions-cell="{ row }">
                <div class="flex gap-2">
                    <ULink :to="`/notes/${noteId}/edit/${row.original.uid}`">
                        <UButton icon="i-heroicons-pencil-square">Edit</UButton>
                    </ULink>
                    <UButton icon="i-heroicons-trash" color="error" @click="onDeleteEntry(row.original.uid)">Delete
                    </UButton>
                </div>
            </template>
        </UTable>

        <div v-else-if="!currentNote" class="loading-state">
            Loading report note...
        </div>

        <div v-else class="empty-state">
            This report note doesn't have any entries yet.
        </div>

        <div class="absolute bottom-10 left-0 right-0">
            <ULink :href="`/notes/${noteId}/new`" class="flex justify-center mt-3">
                <UButton icon="i-heroicons-plus" size="xl">Add</UButton>
            </ULink>
        </div>
    </UContainer>
</template>

<style>
.report-note-table {
    margin: 1rem;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
}
</style>
