import { defineStore } from 'pinia';
import { ReportNotesDBService } from '~/services/report_notes_db';
import type { ReportNote, ReportNoteEntry } from '~/models/report_note';

/**
 * Store for managing report notes using Pinia setup store syntax
 */
export const useReportNoteStore = defineStore('reportNote', () => {
    // State
    const reportNotes = ref<ReportNote[]>([]);
    const currentReportNote = ref<ReportNote | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);
    const dbService = new ReportNotesDBService();

    /**
     * Load all report notes from the database
     */
    async function fetchAllReportNotes(): Promise<void> {
        isLoading.value = true;
        error.value = undefined;

        try {
            reportNotes.value = await dbService.getAll();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Failed to fetch report notes:', err);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Load a specific report note by ID
     */
    async function fetchReportNoteById(id: number): Promise<void> {
        isLoading.value = true;
        error.value = undefined;

        try {
            const note = await dbService.getById(id);
            currentReportNote.value = note;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error(`Failed to fetch report note with ID ${id}:`, err);
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Create a new report note
     */
    async function createReportNote(reportNote: Omit<ReportNote, 'id'>): Promise<ReportNote> {
        isLoading.value = true;
        error.value = undefined;

        try {
            const now = new Date();
            const newNote: ReportNote = {
                ...reportNote,
                createdAt: now,
                lastModified: now
            };

            const id = await dbService.saveReport(newNote);
            newNote.id = id;
            reportNotes.value.push(newNote);
            return newNote;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Failed to create report note:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Update an existing report note
     */
    async function updateReportNote(reportNote: ReportNote): Promise<ReportNote> {
        isLoading.value = true;
        error.value = undefined;

        try {
            if (!reportNote.id) {
                throw new Error('Cannot update report note without ID');
            }

            const updatedNoteId = await dbService.saveReport({
                ...reportNote,
                lastModified: new Date()
            });

            const newNote = await dbService.getById(updatedNoteId);

            // Update the note in the local array
            const index = reportNotes.value.findIndex(note => note.id === updatedNoteId);
            if (index !== -1 && newNote) {
                reportNotes.value[index] = newNote;
            }

            if (currentReportNote.value?.id === updatedNoteId) {
                currentReportNote.value = newNote;
            }

            return newNote!;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Failed to update report note:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Delete a report note by ID
     */
    async function deleteReportNote(id: number): Promise<void> {
        isLoading.value = true;
        error.value = undefined;

        try {
            await dbService.delete(id);

            // Remove the note from the local array
            reportNotes.value = reportNotes.value.filter(note => note.id !== id);

            if (currentReportNote.value?.id === id) {
                currentReportNote.value = null;
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error(`Failed to delete report note with ID ${id}:`, err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Add an entry to the current report note
     */
    async function addEntryToCurrentNote(entry: ReportNoteEntry): Promise<void> {
        if (!currentReportNote.value) {
            throw new Error('No current report note selected');
        }

        const updatedNote = {
            ...currentReportNote.value,
            entries: [...currentReportNote.value.entries, entry],
            lastModified: new Date()
        };

        await updateReportNote(updatedNote);
    }

    /**
     * Update an entry in the current report note
     */
    async function updateEntryInCurrentNote(index: number, entry: ReportNoteEntry): Promise<void> {
        if (!currentReportNote.value) {
            throw new Error('No current report note selected');
        }

        if (index < 0 || index >= currentReportNote.value.entries.length) {
            throw new Error('Invalid entry index');
        }

        const entries = [...currentReportNote.value.entries];
        entries[index] = entry;

        const updatedNote = {
            ...currentReportNote.value,
            entries,
            lastModified: new Date()
        };

        await updateReportNote(updatedNote);
    }

    /**
     * Remove an entry from the current report note
     */
    async function removeEntryFromCurrentNote(index: number): Promise<void> {
        if (!currentReportNote.value) {
            throw new Error('No current report note selected');
        }

        if (index < 0 || index >= currentReportNote.value.entries.length) {
            throw new Error('Invalid entry index');
        }

        const entries = currentReportNote.value.entries.filter((_, i) => i !== index);

        const updatedNote = {
            ...currentReportNote.value,
            entries,
            lastModified: new Date()
        };

        await updateReportNote(updatedNote);
    }

    /**
     * Set the current report note
     */
    function setCurrentReportNote(reportNote: ReportNote | null): void {
        currentReportNote.value = reportNote;
    }

    /**
     * Clear any error message
     */
    function clearError(): void {
        error.value = undefined;
    }

    return {
        // State
        reportNotes,
        currentReportNote,
        isLoading,
        error,

        // Actions
        fetchAllReportNotes,
        fetchReportNoteById,
        createReportNote,
        updateReportNote,
        deleteReportNote,
        addEntryToCurrentNote,
        updateEntryInCurrentNote,
        removeEntryFromCurrentNote,
        setCurrentReportNote,
        clearError,
    };
});
