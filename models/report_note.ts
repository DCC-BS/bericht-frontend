// Define interfaces for the report structure
export interface ReportNoteEntry {
    timestamp: Date;
    notes?: string;
    audioFile?: Blob;
    text?: string;
    images: Blob[];
}

export interface ReportNote {
    id?: number; // Auto-generated ID from IndexedDB
    name: string;
    createdAt: Date;
    lastModified: Date;
    entries: ReportNoteEntry[];
}