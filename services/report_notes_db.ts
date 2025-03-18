import type { ReportNote, ReportNoteEntry } from '../models/report_note';

// Database constants
const DB_NAME = 'ReportNotesDatabase';
const DB_VERSION = 2; // Increased version for schema migration
const REPORTS_STORE = 'report_notes';
const IMAGES_STORE = 'report_images'; // New store for images

/**
 * Internal representation of a report note entry with image references instead of blobs
 */
interface InternalReportNoteEntry {
    uid: string;
    timestamp: Date;
    notes?: string;
    audioFile?: Blob;
    text?: string;
    imageIds: number[]; // Store image IDs instead of blobs
}

/**
 * Internal representation of a report note with image references
 */
interface InternalReportNote {
    id?: number;
    uid: string;
    name: string;
    createdAt: Date;
    lastModified: Date;
    entries: InternalReportNoteEntry[];
}

/**
 * Image object to be stored in the images store
 */
interface StoredImage {
    id?: number; // Auto-generated ID
    blob: Blob;
    reportId?: number; // Optional reference to the report
    createdAt: Date;
}

export class ReportNotesDBService {
    private db: IDBDatabase | null = null;

    /**
     * Initialize the IndexedDB database
     * @returns Promise that resolves when the database is initialized
     */
    async initialize(): Promise<void> {
        if (this.db) {
            return;
        }

        return new Promise((resolve, reject) => {
            // Open or create the IndexedDB database
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            // Handle database upgrade or creation
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const oldVersion = event.oldVersion;

                // Create reports store if it doesn't exist
                if (!db.objectStoreNames.contains(REPORTS_STORE)) {
                    const store = db.createObjectStore(REPORTS_STORE, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    // Create indexes for faster queries
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('createdAt', 'createdAt', {
                        unique: false,
                    });
                    store.createIndex('lastModified', 'lastModified', {
                        unique: false,
                    });
                    store.createIndex('uid', 'uid', { unique: true });
                }

                // Create images store if it doesn't exist
                if (!db.objectStoreNames.contains(IMAGES_STORE)) {
                    const imagesStore = db.createObjectStore(IMAGES_STORE, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    imagesStore.createIndex('reportId', 'reportId', {
                        unique: false,
                    });
                    imagesStore.createIndex('createdAt', 'createdAt', {
                        unique: false,
                    });
                }

                // Migration logic for existing data if needed
                if (oldVersion === 1 && event.newVersion === 2) {
                    this.migrateDataToV2(db);
                }
            };

            // Success handler
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            // Error handler
            request.onerror = (event) => {
                reject(
                    `Database initialization failed: ${(event.target as IDBOpenDBRequest).error}`,
                );
            };
        });
    }

    /**
     * Migrate data from version 1 to version 2
     * @param db Database instance
     */
    private async migrateDataToV2(db: IDBDatabase): Promise<void> {
        // This function will migrate existing data to the new schema
        // Get all reports from old schema and convert them to new schema
        const transaction = db.transaction([REPORTS_STORE], 'readonly');
        const store = transaction.objectStore(REPORTS_STORE);
        const request = store.getAll();

        request.onsuccess = async () => {
            const oldReports = request.result as ReportNote[];
            if (!oldReports.length) return;

            // Process each report to extract images and update report entries
            for (const report of oldReports) {
                await this.saveReportWithSeparateImages(report);
            }
        };
    }

    /**
     * Save an image to the database
     * @param image The image blob to save
     * @param reportId Optional ID of the report this image belongs to
     * @returns The ID of the saved image
     */
    private async saveImage(image: Blob, reportId?: number): Promise<number> {
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [IMAGES_STORE],
                'readwrite',
            );
            const store = transaction.objectStore(IMAGES_STORE);

            const storedImage: StoredImage = {
                blob: image,
                reportId,
                createdAt: new Date(),
            };

            const request = store.add(storedImage);

            request.onsuccess = () => {
                resolve(request.result as number);
            };

            request.onerror = () => {
                reject(`Failed to save image: ${request.error}`);
            };
        });
    }

    /**
     * Get an image by ID
     * @param id The ID of the image
     * @returns The image blob or undefined if not found
     */
    private async getImageById(id: number): Promise<Blob | undefined> {
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [IMAGES_STORE],
                'readonly',
            );
            const store = transaction.objectStore(IMAGES_STORE);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result as StoredImage | undefined;
                resolve(result?.blob);
            };

            request.onerror = () => {
                reject(`Failed to get image: ${request.error}`);
            };
        });
    }

    /**
     * Convert an external report to internal format with image IDs
     * @param report External report with image blobs
     * @returns Internal report with image references
     */
    private async externalToInternalReport(
        report: ReportNote,
    ): Promise<InternalReportNote> {
        const internalReport: InternalReportNote = {
            ...report,
            entries: await Promise.all(
                report.entries.map(async (entry) => {
                    // Save each image and collect their IDs
                    const imageIds: number[] = [];
                    if (entry.images && entry.images.length > 0) {
                        for (const imageBlob of entry.images) {
                            const imageId = await this.saveImage(
                                imageBlob,
                                report.id,
                            );
                            imageIds.push(imageId);
                        }
                    }

                    return {
                        uid: entry.uid,
                        timestamp: entry.timestamp,
                        notes: entry.notes,
                        audioFile: entry.audioFile,
                        text: entry.text,
                        imageIds,
                    };
                }),
            ),
        };

        return internalReport;
    }

    /**
     * Convert an internal report to external format with image blobs
     * @param internalReport Internal report with image references
     * @returns External report with image blobs
     */
    private async internalToExternalReport(
        internalReport: InternalReportNote,
    ): Promise<ReportNote> {
        const externalReport: ReportNote = {
            ...internalReport,
            entries: await Promise.all(
                internalReport.entries.map(async (entry) => {
                    // Retrieve all images for this entry
                    const images: Blob[] = [];
                    if (entry.imageIds && entry.imageIds.length > 0) {
                        for (const imageId of entry.imageIds) {
                            const imageBlob = await this.getImageById(imageId);
                            if (imageBlob) {
                                images.push(imageBlob);
                            }
                        }
                    }

                    return {
                        uid: entry.uid,
                        timestamp: entry.timestamp,
                        notes: entry.notes,
                        audioFile: entry.audioFile,
                        text: entry.text,
                        images,
                    } as ReportNoteEntry;
                }),
            ),
        };

        return externalReport;
    }

    /**
     * Save a new report or update an existing one with separate image storage
     * @param report The report to save
     * @returns Promise with the ID of the saved report
     */
    async saveReport(report: ReportNote): Promise<number> {
        // Make sure the database is initialized
        if (!this.db) {
            await this.initialize();
        }

        // Convert to internal format
        const internalReport = await this.externalToInternalReport(report);

        return this.saveInternalReport(internalReport);
    }

    /**
     * Save the internal representation of a report
     * @param internalReport The internal report to save
     * @returns Promise with the ID of the saved report
     */
    private async saveInternalReport(
        internalReport: InternalReportNote,
    ): Promise<number> {
        return new Promise((resolve, reject) => {
            // Start a transaction
            const transaction = this.db!.transaction(
                [REPORTS_STORE],
                'readwrite',
            );
            const store = transaction.objectStore(REPORTS_STORE);

            // Add or update the report
            const request = internalReport.id
                ? store.put(internalReport)
                : store.add(internalReport);

            request.onsuccess = () => {
                // Return the generated ID
                resolve(request.result as number);
            };

            request.onerror = () => {
                reject(`Failed to save report: ${request.error}`);
            };
        });
    }

    /**
     * Special method for migrating an old report with embedded images to the new format
     * @param report The old format report to save
     * @returns Promise with the ID of the saved report
     */
    private async saveReportWithSeparateImages(
        report: ReportNote,
    ): Promise<number> {
        const internalReport = await this.externalToInternalReport(report);
        return this.saveInternalReport(internalReport);
    }

    /**
     * Get all reports from the database
     * @returns Promise with an array of all reports
     */
    async getAll(): Promise<ReportNote[]> {
        // Make sure the database is initialized
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [REPORTS_STORE],
                'readonly',
            );
            const store = transaction.objectStore(REPORTS_STORE);
            const request = store.getAll();

            request.onsuccess = async () => {
                const internalReports = request.result as InternalReportNote[];
                const externalReports: ReportNote[] = [];

                // Convert each report to external format
                for (const internalReport of internalReports) {
                    const externalReport =
                        await this.internalToExternalReport(internalReport);
                    externalReports.push(externalReport);
                }

                resolve(externalReports);
            };

            request.onerror = () => {
                reject(`Failed to get reports: ${request.error}`);
            };
        });
    }

    /**
     * Get a specific report by ID
     * @param id The ID of the report to retrieve
     * @returns Promise with the requested report or null if not found
     */
    async getById(id: number): Promise<ReportNote | null> {
        // Make sure the database is initialized
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [REPORTS_STORE],
                'readonly',
            );
            const store = transaction.objectStore(REPORTS_STORE);
            const request = store.get(id);

            request.onsuccess = async () => {
                const internalReport = request.result as
                    | InternalReportNote
                    | undefined;
                if (!internalReport) {
                    resolve(null);
                    return;
                }

                const externalReport =
                    await this.internalToExternalReport(internalReport);
                resolve(externalReport);
            };

            request.onerror = () => {
                reject(`Failed to get report: ${request.error}`);
            };
        });
    }

    /**
     * Get a report note by its unique identifier
     * @param uid - The unique identifier of the report note
     * @returns The report note with the specified UID
     * @throws Error if the report note is not found
     */
    async getByUid(uid: string): Promise<ReportNote> {
        // Make sure the database is initialized
        if (!this.db) {
            await this.initialize();
        }

        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db!.transaction(
                    [REPORTS_STORE],
                    'readonly',
                );
                const store = transaction.objectStore(REPORTS_STORE);
                const index = store.index('uid');
                const request = index.get(uid);

                request.onsuccess = async () => {
                    const internalReport = request.result as
                        | InternalReportNote
                        | undefined;
                    if (!internalReport) {
                        reject(
                            new Error(`Report note with UID ${uid} not found`),
                        );
                        return;
                    }

                    const externalReport =
                        await this.internalToExternalReport(internalReport);
                    resolve(externalReport);
                };

                request.onerror = () => {
                    reject(`Failed to get report by UID: ${request.error}`);
                };
            });
        } catch (err) {
            console.error(`Error getting report note by UID ${uid}:`, err);
            throw err;
        }
    }

    /**
     * Delete a report by ID
     * @param id The ID of the report to delete
     * @returns Promise that resolves when the report is deleted
     */
    async delete(id: number): Promise<void> {
        // Make sure the database is initialized
        if (!this.db) {
            await this.initialize();
        }

        // First get the report to find associated images
        const report = (await this.getById(id)) as ReportNote;
        if (!report) {
            return; // Nothing to delete
        }

        // Delete the report
        await new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(
                [REPORTS_STORE],
                'readwrite',
            );
            const store = transaction.objectStore(REPORTS_STORE);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(`Failed to delete report: ${request.error}`);
            };
        });

        // Delete associated images
        await this.deleteImagesByReportId(id);
    }

    /**
     * Delete all images associated with a specific report
     * @param reportId The ID of the report whose images should be deleted
     */
    private async deleteImagesByReportId(reportId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [IMAGES_STORE],
                'readwrite',
            );
            const store = transaction.objectStore(IMAGES_STORE);
            const index = store.index('reportId');
            const request = index.openCursor(IDBKeyRange.only(reportId));

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    // Delete this image
                    cursor.delete();
                    cursor.continue();
                } else {
                    // No more images to delete
                    resolve();
                }
            };

            request.onerror = () => {
                reject(`Failed to delete images: ${request.error}`);
            };
        });
    }

    /**
     * Search reports by name (partial match)
     * @param searchTerm The term to search for in report names
     * @returns Promise with array of matching reports
     */
    async searchReportsByName(searchTerm: string): Promise<ReportNote[]> {
        const allReports = await this.getAll();
        const lowercaseTerm = searchTerm.toLowerCase();

        // Filter reports by name containing the search term
        return allReports.filter((report) =>
            report.name.toLowerCase().includes(lowercaseTerm),
        );
    }

    /**
     * Get reports sorted by last modified date
     * @param ascending Whether to sort in ascending order (oldest first)
     * @returns Promise with sorted array of reports
     */
    async getReportsSortedByModifiedDate(
        ascending: boolean = false,
    ): Promise<ReportNote[]> {
        const allReports = await this.getAll();

        return allReports.sort((a, b) => {
            const dateA = new Date(a.lastModified).getTime();
            const dateB = new Date(b.lastModified).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }
}

// Export a singleton instance
export const reportsDBService = new ReportNotesDBService();
