import type { ComplaintItemDto } from "~/models/compaint_item";
import type { ComplaintDto } from "~/models/complaint";
import { complaintsItemDBService } from "./complaints_item_db";
import { COMPLAINTS_STORE, databaseService } from "./database_service";

type InternalComplaint = Omit<ComplaintDto, "items"> & {
    itemIds: string[];
};

/**
 * Service for managing complaints and memos in IndexedDB
 */
export class ComplaintsDB {
    /**
     * Get the database instance from the centralized database service
     * @returns Promise resolving to the database instance
     */
    private async getDb(): Promise<IDBDatabase> {
        return await databaseService.getDatabase();
    }

    /**
     * Store a complaint in the database along with its items
     * @param complaint The complaint to store
     * @returns Promise resolving to the stored complaint
     */
    async storeComplaint(complaint: ComplaintDto): Promise<void> {
        const db = await this.getDb();

        // Then store the complaint itself
        const transaction = db.transaction([COMPLAINTS_STORE], "readwrite");
        const store = transaction.objectStore(COMPLAINTS_STORE);

        const internalComplaint = {
            ...complaint,
            items: undefined,
            itemIds: complaint.items.map((item) => item.id),
        } as InternalComplaint & { items: undefined };

        // biome-ignore lint/performance/noDelete: <explanation>
        delete internalComplaint.items;

        const request = store.put(internalComplaint);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(
                    `Failed to store complaint: ${(event.target as IDBOpenDBRequest).error}`,
                );
            };
        });
    }

    /**
     * Get a complaint by its ID
     * @param id The ID of the complaint to retrieve
     * @returns Promise resolving to the complaint, or undefined if not found
     */
    async getComplaint(id: string): Promise<ComplaintDto> {
        const db = await this.getDb();

        const transaction = db.transaction([COMPLAINTS_STORE], "readonly");
        const store = transaction.objectStore(COMPLAINTS_STORE);

        const request = store.get(id);

        const internalComplaints: InternalComplaint = await new Promise(
            (resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = (event) => {
                    reject(
                        `Failed to get complaint: ${(event.target as IDBOpenDBRequest).error}`,
                    );
                };
            },
        );

        const items = await Promise.all(
            internalComplaints.itemIds.map((id) =>
                complaintsItemDBService.getItem(id),
            ),
        );

        return {
            ...internalComplaints,
            items: items.filter(
                (item) => item !== undefined,
            ) as ComplaintItemDto[],
        };
    } /**
     * Delete a complaint by its ID along with all its related items
     * @param id The ID of the complaint to delete
     */
    async deleteComplaint(id: string): Promise<void> {
        // First, get the complaint to extract item IDs
        const complaint = await this.getComplaint(id);

        if (!complaint) {
            return; // Complaint not found, nothing to delete
        }
        // Delete all related items
        await Promise.all([
            // Delete all complaint items
            ...complaint.items.map((item) =>
                complaintsItemDBService.deleteItem(item.id),
            ),
        ]);

        // Delete the complaint itself
        const db = await this.getDb();
        const transaction = db.transaction([COMPLAINTS_STORE], "readwrite");
        const store = transaction.objectStore(COMPLAINTS_STORE);

        const request = store.delete(id);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(
                    `Failed to delete complaint: ${(event.target as IDBOpenDBRequest).error}`,
                );
            };
        });
    }
}

// Export a singleton instance
export const complaintsDBService = new ComplaintsDB();
