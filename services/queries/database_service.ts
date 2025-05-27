/**
 * Centralized database service for initializing and managing the IndexedDB database
 * This service handles creation of all object stores for the application
 */

// Database constants
const DB_NAME = "ReportsDatabase";
// Centralized version control - increment this when changing the database schema
const DB_VERSION = 2; // Current version

// Store names
const REPORTS_STORE = "reports";
const COMPLAINTS_STORE = "complaints";
const COMPLAINT_ITEMS_STORE = "complaint_items";

/**
 * Database service for managing the shared IndexedDB instance
 */
export class DatabaseService {
    static $injectKey = "databaseService";
    static $inject = [];

    private db: IDBDatabase | null = null;
    private initializationPromise: Promise<IDBDatabase> | null = null;

    /**
     * Get the database instance, initializing it if necessary
     * @returns Promise resolving to the database instance
     */
    public async getDatabase(): Promise<IDBDatabase> {
        if (this.db) {
            return this.db;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this.initialize();
        return this.initializationPromise;
    }

    /**
     * Initialize the IndexedDB database with all required object stores
     * @returns Promise that resolves when the database is initialized
     */
    private async initialize(): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            // Check if IndexedDB is available (for SSR compatibility)
            if (typeof indexedDB === "undefined") {
                reject(
                    new Error("IndexedDB is not available in this environment"),
                );
                return;
            }

            // Open or create the IndexedDB database
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            // Handle database upgrade or creation
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const oldVersion = event.oldVersion;
                const newVersion = event.newVersion || DB_VERSION;

                console.log(
                    `Upgrading database from version ${oldVersion} to ${newVersion}...`,
                );

                // Create reports store if it doesn't exist
                if (!db.objectStoreNames.contains(REPORTS_STORE)) {
                    const reportsStore = db.createObjectStore(REPORTS_STORE, {
                        keyPath: "id",
                        autoIncrement: true,
                    });
                    reportsStore.createIndex("id", "id", { unique: true });
                }

                // Create complaints store if it doesn't exist
                if (!db.objectStoreNames.contains(COMPLAINTS_STORE)) {
                    const complaintsStore = db.createObjectStore(
                        COMPLAINTS_STORE,
                        {
                            keyPath: "id",
                        },
                    );
                    complaintsStore.createIndex("id", "id", { unique: true });
                    complaintsStore.createIndex("type", "type", {
                        unique: false,
                    });
                }

                // Create complaint items store if it doesn't exist
                if (!db.objectStoreNames.contains(COMPLAINT_ITEMS_STORE)) {
                    const complaintItemsStore = db.createObjectStore(
                        COMPLAINT_ITEMS_STORE,
                        {
                            keyPath: "id",
                        },
                    );
                    complaintItemsStore.createIndex("id", "id", {
                        unique: true,
                    });
                }
            };

            // Success handler
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;

                // Log successful database connection
                console.log(
                    `Successfully connected to database ${DB_NAME} v${DB_VERSION}`,
                );

                // Resolve with the database instance
                resolve(this.db);
            };

            // Error handler
            request.onerror = (event) => {
                const error = (event.target as IDBOpenDBRequest).error;
                reject(`Database initialization failed: ${error}`);
            };
        });
    }

    /**
     * Checks if the database exists, and creates it if it doesn't
     * This is useful when you want to ensure the database is ready before making operations
     * @returns Promise that resolves to true when the database is ready
     */
    async ensureDatabaseExists(): Promise<boolean> {
        // Check if indexedDB is available (will not be available in SSR)
        if (typeof indexedDB === "undefined") {
            throw new Error("IndexedDB is not available in this environment");
        }

        try {
            await this.getDatabase();
            return true;
        } catch (error) {
            console.error("Failed to ensure database exists:", error);
            throw error;
        }
    }
}

// Export constants for other services to use
export {
    DB_NAME,
    DB_VERSION,
    REPORTS_STORE,
    COMPLAINTS_STORE,
    COMPLAINT_ITEMS_STORE,
};
