import type { ReportNote } from '../models/report_note';

// Database constants
const DB_NAME = 'ReportNotesDatabase';
const DB_VERSION = 1;
const REPORTS_STORE = 'report_notes';

export class ReportNotesDBService {
    private db: IDBDatabase | null = null;

    /**
     * Initialize the IndexedDB database
     * @returns Promise that resolves when the database is initialized
     */
    async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Open or create the IndexedDB database
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            // Handle database upgrade or creation
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object store for reports if it doesn't exist
                if (!db.objectStoreNames.contains(REPORTS_STORE)) {
                    const store = db.createObjectStore(REPORTS_STORE, { keyPath: 'id', autoIncrement: true });
                    // Create indexes for faster queries
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    store.createIndex('lastModified', 'lastModified', { unique: false });
                }
            };

            // Success handler
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };

            // Error handler
            request.onerror = (event) => {
                reject(`Database initialization failed: ${(event.target as IDBOpenDBRequest).error}`);
            };
        });
    }

    /**
     * Save a new report or update an existing one
     * @param report The report to save
     * @returns Promise with the ID of the saved report
     */
    async saveReport(report: ReportNote): Promise<number> {
        // Make sure the database is initialized
        if (!this.db) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            // Start a transaction
            const transaction = this.db!.transaction([REPORTS_STORE], 'readwrite');
            const store = transaction.objectStore(REPORTS_STORE);

            // Update lastModified timestamp
            report.lastModified = new Date();

            // Add or update the report
            const request = report.id ? store.put(report) : store.add(report);

            request.onsuccess = (event) => {
                // Return the generated ID
                resolve(request.result as number);
            };

            request.onerror = (event) => {
                reject(`Failed to save report: ${request.error}`);
            };
        });
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
            const transaction = this.db!.transaction([REPORTS_STORE], 'readonly');
            const store = transaction.objectStore(REPORTS_STORE);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
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
            const transaction = this.db!.transaction([REPORTS_STORE], 'readonly');
            const store = transaction.objectStore(REPORTS_STORE);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(`Failed to get report: ${request.error}`);
            };
        });
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

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([REPORTS_STORE], 'readwrite');
            const store = transaction.objectStore(REPORTS_STORE);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(`Failed to delete report: ${request.error}`);
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
        return allReports.filter(report =>
            report.name.toLowerCase().includes(lowercaseTerm)
        );
    }

    /**
     * Get reports sorted by last modified date
     * @param ascending Whether to sort in ascending order (oldest first)
     * @returns Promise with sorted array of reports
     */
    async getReportsSortedByModifiedDate(ascending: boolean = false): Promise<ReportNote[]> {
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
