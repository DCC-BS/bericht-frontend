import type { ReportNote, ReportNoteEntry } from '~/models/report_note';
import { ReportNotesDBService } from '~/services/report_notes_db';
import { generateUUID } from '~/utils/uuid';

const dbService = new ReportNotesDBService();

export function useReportNote() {
    dbService.initialize();

    const store = useReportNoteStore();

    async function createNewReportNote(
        note: Partial<ReportNote>,
    ): Promise<ReportNote> {
        const newNote: ReportNote = {
            uid: generateUUID(),
            name: `New Report ${new Date().toLocaleString()}`,
            createdAt: new Date(),
            lastModified: new Date(),
            entries: [],
            ...note,
        };

        await dbService.saveReport(newNote);
        store.$patch({
            currentReportNote: newNote,
        });
        return newNote;
    }

    async function setReportNoteByUid(uid: string): Promise<ReportNote | null> {
        store.$patch({
            currentReportNote: await dbService.getByUid(uid),
        });
        return store.currentReportNote;
    }

    async function addEntyToCurrentReportNote(
        entry: Partial<ReportNoteEntry>,
    ): Promise<void> {
        if (!store.currentReportNote) {
            throw new Error('No current report note set');
        }

        const newEntry: ReportNoteEntry = {
            uid: generateUUID(),
            timestamp: new Date(),
            images: [],
            ...entry,
        };

        const newEnties = [...store.currentReportNote.entries, newEntry];
        const newNote = {
            ...store.currentReportNote,
            entries: newEnties,
            lastModified: new Date(),
        };

        store.$patch({
            currentReportNote: newNote,
        });

        await dbService.saveReport(store.currentReportNote);
    }

    function getEntyByUid(uid: string): ReportNoteEntry | undefined {
        if (!store.currentReportNote) {
            throw new Error('No current report note set');
        }

        return store.currentReportNote.entries.find(
            (entry) => entry.uid === uid,
        );
    }

    function updateEntry(entry: ReportNoteEntry): void {
        if (!store.currentReportNote) {
            throw new Error('No current report note set');
        }

        const index = store.currentReportNote.entries.findIndex(
            (e) => e.uid === entry.uid,
        );

        if (index === -1) {
            throw new Error(`Entry with UID ${entry.uid} not found`);
        }

        const newEntry = {
            ...store.currentReportNote.entries[index],
            lastModified: new Date(),
            ...entry,
        };

        const newNote = {
            ...store.currentReportNote,
            entries: [
                ...store.currentReportNote.entries.slice(0, index),
                newEntry,
                ...store.currentReportNote.entries.slice(index + 1),
            ],
        };

        store.$patch({
            currentReportNote: newNote,
        })
        dbService.saveReport(store.currentReportNote);
    }

    function deleteEntry(uid: string): void {
        if (!store.currentReportNote) {
            throw new Error('No current report note set');
        }

        const index = store.currentReportNote.entries.findIndex(
            (entry) => entry.uid === uid,
        );

        if (index === -1) {
            throw new Error(`Entry with UID ${uid} not found`);
        }

        const newNote = {
            ...store.currentReportNote,
            entries: [
                ...store.currentReportNote.entries.slice(0, index),
                ...store.currentReportNote.entries.slice(index + 1),
            ],
        };

        store.$patch({
            currentReportNote: newNote,
        });

        dbService.saveReport(store.currentReportNote);
    }

    return {
        currentNote: computed(() => store.currentReportNote),
        createNewReportNote,
        setReportNoteByUid,
        addEntyToCurrentReportNote,
        getEntyByUid,
        updateEntry,
        deleteEntry,
    };
}
