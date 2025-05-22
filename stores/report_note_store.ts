import { defineStore } from "pinia";
import type { ReportNote } from "~/models/report_note";

/**
 * Store for managing report notes using Pinia setup store syntax
 */
export const useReportNoteStore = defineStore("reportNote", () => {
    // State
    const currentReportNote = ref<ReportNote | null>(null);

    return {
        currentReportNote,
    };
});
