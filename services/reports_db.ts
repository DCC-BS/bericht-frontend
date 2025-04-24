import { type IReport, type ReportDto, createReport } from "~/models/report";
import { type IComplaint, type ComplaintDto, createComplaint } from "~/models/complaint";

// Database constants
const DB_NAME = 'ReportsDatabase';
const DB_VERSION = 1; // Increased version for schema migration
const REPORTS_STORE = 'reports';
const IMAGES_STORE = 'complaint_images'; // New store for images

type InternalReport = Omit<ReportDto, "complaints"> & { complaints: InternalComplaint[] };

type InternalComplaint = Omit<ComplaintDto, 'images'> & {
    imageIds: number[]; // Store image IDs instead of blobs
};

/**
 * Image object to be stored in the images store
 */
type StoredImage = {
    id?: number; // Auto-generated ID
    blob: Blob;
    reportId?: string; // Optional reference to the report
    createdAt: Date;
}

export class ReportsDB {
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

                // Create reports store if it doesn't exist
                if (!db.objectStoreNames.contains(REPORTS_STORE)) {
                    const store = db.createObjectStore(REPORTS_STORE, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });

                    // Create indexes for faster queries
                    store.createIndex('id', 'id', { unique: true });

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
                    imagesStore.createIndex('id', 'id', {
                        unique: true,
                    });
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
     * Save an image to the database
     * @param image The image blob to save
     * @param reportId Optional ID of the report this image belongs to
     * @returns The ID of the saved image
     */
    private async saveImage(image: Blob, reportId?: string): Promise<number> {
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
     * Convert an internal report to external format with image blobs
     * @param internalReport Internal report with image references
     * @returns External report with image blobs
     */
    private async internalToExternalReport(
        internalReport: InternalReport,
    ): Promise<IReport> {
        const reportDto: ReportDto = {
            ...internalReport,
            complaints: await Promise.all(
                internalReport.complaints.map(async (complain) => {
                    // Retrieve all images for this entry
                    const images: Blob[] = [];
                    if (complain.imageIds && complain.imageIds.length > 0) {
                        for (const imageId of complain.imageIds) {
                            const imageBlob = await this.getImageById(imageId);
                            if (imageBlob) {
                                images.push(imageBlob);
                            }
                        }
                    }

                    return {
                        ...complain,
                        images,
                    } as ComplaintDto;
                }),
            ),
        };

        return createReport(reportDto);
    }

    private async externalToInternalReport(
        report: IReport,
    ): Promise<InternalReport> {
        const reportDto: ReportDto = report.toDto();

        // Convert complaints to internal format
        const internalComplaints: InternalComplaint[] = await Promise.all(
            reportDto.complaints.map(async (complaint) => {
                const imageIds: number[] = [];

                // Save each image and store its ID
                for (const image of complaint.images) {
                    const imageId = await this.saveImage(image, reportDto.id);
                    imageIds.push(imageId);
                }

                return {
                    ...complaint,
                    imageIds,
                } as InternalComplaint;
            }),
        );

        return {
            ...reportDto,
            complaints: internalComplaints,
        } as InternalReport;
    }

    /**
     * Save a new report or update an existing one with separate image storage
     * @param report The report to save
     * @returns Promise with the ID of the saved report
     */
    async saveReport(report: IReport): Promise<number> {
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
        internalReport: InternalReport,
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
     * Get all reports from the database
     * @returns Promise with an array of all reports
     */
    async getAll(): Promise<IReport[]> {
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
                const internalReports = request.result as InternalReport[];
                const externalReports: IReport[] = [];

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
     * Get a report note by its unique identifier
     * @param uid - The unique identifier of the report note
     * @returns The report note with the specified UID
     * @throws Error if the report note is not found
     */
    async getById(id: string): Promise<IReport> {
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
                const index = store.index('id');
                const request = index.get(id);

                request.onsuccess = async () => {
                    const internalReport = request.result as
                        | InternalReport
                        | undefined;
                    if (!internalReport) {
                        reject(
                            new Error(`Report note with id ${id} not found`),
                        );
                        return;
                    }

                    const externalReport =
                        await this.internalToExternalReport(internalReport);
                    resolve(externalReport);
                };

                request.onerror = () => {
                    reject(`Failed to get report by id: ${request.error}`);
                };
            });
        } catch (err) {
            console.error(`Error getting report note by id ${id}:`, err);
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
        const report = (await this.getById(id)) as IReport;
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
    async searchReportsByName(searchTerm: string): Promise<IReport[]> {
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
    ): Promise<IReport[]> {
        const allReports = await this.getAll();

        return allReports.sort((a, b) => {
            const dateA = new Date(a.lastModified).getTime();
            const dateB = new Date(b.lastModified).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }
}

// Export a singleton instance
export const reportsDBService = new ReportsDB();
