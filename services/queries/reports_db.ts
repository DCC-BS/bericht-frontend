import type { ReportDto } from "~/models/report";
import { ComplaintsDB } from "./complaints_db";
import { DatabaseService, REPORTS_STORE } from "./database_service";

/**
 * Internal report representation for storage
 */
type InternalReport = Omit<ReportDto, "complaints"> & {
    complaintIds: string[];
};

/**
 * Service for managing reports in IndexedDB
 */
export class ReportsDB {
    static $injectKey = "reportsDB";
    static $inject = [DatabaseService.$injectKey, ComplaintsDB.$injectKey];

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly complaintsDB: ComplaintsDB,
    ) {}

    /**
     * Get the database instance from the centralized database service
     * @returns Promise resolving to the database instance
     */
    private async getDb(): Promise<IDBDatabase> {
        return await this.databaseService.getDatabase();
    }

    /**
     * Convert an internal report to external format with image blobs
     * @param internalReport Internal report with image references
     * @returns External report with image blobs
     */
    private async internalToExternalReport(
        internalReport: InternalReport,
    ): Promise<ReportDto> {
        const complaints = await Promise.all(
            internalReport.complaintIds.map(
                async (complaintId) => await this.complaintsDB.get(complaintId),
            ),
        );

        return {
            ...internalReport,
            complaints: complaints.filter(
                (complaint) => complaint !== undefined,
            ),
        };
    }

    /**
     * Save a new report or update an existing one
     * @param report The report to save
     * @returns Promise with the ID of the saved report
     */
    async put(report: ReportDto): Promise<number> {
        // Convert to internal format
        const internalReport = {
            ...report,
            complaints: undefined,
            complaintIds: report.complaints.map((complaint) => complaint.id),
        };

        // biome-ignore lint/performance/noDelete: <explanation>
        delete internalReport.complaints;

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
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            // Start a transaction
            const transaction = db.transaction([REPORTS_STORE], "readwrite");
            const store = transaction.objectStore(REPORTS_STORE);

            // Add or update the report
            const request = store.put(internalReport);

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
    async getAll(): Promise<ReportDto[]> {
        // Make sure the database is initialized
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([REPORTS_STORE], "readonly");
            const store = transaction.objectStore(REPORTS_STORE);
            const request = store.getAll();

            request.onsuccess = async () => {
                const internalReports = request.result as InternalReport[];
                const externalReports: ReportDto[] = [];

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
     * Get a report by its unique identifier
     * @param id The unique identifier of the report
     * @returns The report with the specified ID
     * @throws Error if the report is not found
     */
    async get(id: string): Promise<ReportDto> {
        const db = await this.getDb();

        try {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([REPORTS_STORE], "readonly");
                const store = transaction.objectStore(REPORTS_STORE);
                const index = store.index("id");
                const request = index.get(id);

                request.onsuccess = async () => {
                    const internalReport = request.result as
                        | InternalReport
                        | undefined;
                    if (!internalReport) {
                        reject(new Error(`Report with id ${id} not found`));
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
            console.error(`Error getting report by id ${id}:`, err);
            throw err;
        }
    }

    /**
     * Delete a report by ID
     * @param id The ID of the report to delete
     * @returns Promise that resolves when the report is deleted
     */
    async delete(id: string): Promise<void> {
        const db = await this.getDb();

        // Delete the report
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([REPORTS_STORE], "readwrite");
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
}
