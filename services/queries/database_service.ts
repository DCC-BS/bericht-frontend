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
     * Deletes the existing IndexedDB database
     * @returns Promise that resolves when the database is deleted
     */
    private async deleteDatabase(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // Check if IndexedDB is available
            if (typeof indexedDB === "undefined") {
                reject(
                    new Error("IndexedDB is not available in this environment"),
                );
                return;
            }

            const request = indexedDB.deleteDatabase(DB_NAME);

            request.onsuccess = () => {
                console.log(`Database ${DB_NAME} successfully deleted`);
                resolve();
            };

            request.onerror = (event) => {
                const error = (event.target as IDBOpenDBRequest).error;
                reject(`Failed to delete database: ${error}`);
            };
        });
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

                // If migrating from version 1, delete all object stores and recreate them
                // Note: This will delete all data - appropriate for major schema changes
                if (oldVersion === 1 && newVersion > oldVersion) {
                    // Get all existing object store names
                    const storeNames = Array.from(db.objectStoreNames);

                    // Delete all existing object stores
                    for (const storeName of storeNames) {
                        db.deleteObjectStore(storeName);
                    }

                    console.log(
                        "Deleted all object stores from version 1 database",
                    );
                }

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

            // Handle blocked event - this occurs when there are open connections to the database
            request.onblocked = () => {
                console.warn(
                    "Database upgrade was blocked. Please close all other tabs with this site open.",
                );
                // Attempt to force close all connections
                this.forceCloseConnections()
                    .then(() => {
                        console.log(
                            "Attempting to reinitialize after closing connections",
                        );
                        this.db = null;
                        this.initializationPromise = null;
                        this.initialize().then(resolve).catch(reject);
                    })
                    .catch((error) => {
                        console.error(
                            "Failed to force close connections:",
                            error,
                        );
                        reject(error);
                    });
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
     * Force close all connections to the database
     * This is used when a database upgrade is blocked
     * @returns Promise that resolves when all connections are closed
     */
    private async forceCloseConnections(): Promise<void> {
        // If we have an open connection, close it
        if (this.db) {
            this.db.close();
            this.db = null;
        }

        return Promise.resolve();
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

    /**
     * Force a complete database recreation by deleting and reinitializing
     * This can be used to handle major schema changes or data corruption
     * WARNING: This will delete all data in the database
     * @returns Promise that resolves when the database is reinitialized
     */
    async recreateDatabase(): Promise<IDBDatabase> {
        // Close any existing connections
        if (this.db) {
            this.db.close();
            this.db = null;
        }

        this.initializationPromise = null;

        try {
            // Delete the database
            await this.deleteDatabase();

            // Reinitialize
            return this.getDatabase();
        } catch (error) {
            console.error("Failed to recreate database:", error);
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
