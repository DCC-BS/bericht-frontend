import type { ComplaintDto } from "~/models/complaint";
import type { ComplaintItemDto } from "~/models/compaint_item";
import { databaseService, COMPLAINT_ITEMS_STORE } from "./database_service";

/**
 * Service for managing complaint items in IndexedDB
 */
export class ComplaintsItemDB {
    /**
     * Get the database instance from the centralized database service
     * @returns Promise resolving to the database instance
     */
    private async getDb(): Promise<IDBDatabase> {
        return await databaseService.getDatabase();
    }

    async storeItem(item: ComplaintItemDto): Promise<ComplaintItemDto> {
        const db = await this.getDb();

        const transaction = db.transaction([COMPLAINT_ITEMS_STORE], 'readwrite');
        const store = transaction.objectStore(COMPLAINT_ITEMS_STORE);

        const request = store.put(
            item,
        );

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(item);
            };

            request.onerror = (event) => {
                reject(
                    `Failed to store complaint item: ${(event.target as IDBOpenDBRequest).error}`,
                );
            };
        });
    }

    async getItem(id: string): Promise<ComplaintItemDto> {
        const db = await this.getDb();

        const transaction = db.transaction([COMPLAINT_ITEMS_STORE], 'readonly');
        const store = transaction.objectStore(COMPLAINT_ITEMS_STORE);

        const request = store.get(id);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(
                    `Failed to get complaint item: ${(event.target as IDBOpenDBRequest).error}`,
                );
            };
        });
    }

    async deleteItem(id: string): Promise<void> {
        const db = await this.getDb();

        const transaction = db.transaction([COMPLAINT_ITEMS_STORE], 'readwrite');
        const store = transaction.objectStore(COMPLAINT_ITEMS_STORE);

        const request = store.delete(id);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(
                    `Failed to delete complaint item: ${(event.target as IDBOpenDBRequest).error}`,
                );
            };
        });
    }

    /**
     * Extract IDs of various types from a complaint
     * @param complaint The complaint to extract IDs from
     * @returns Object containing arrays of IDs by type
     */
    extractItemIds(complaint: ComplaintDto): { imageIds: string[], memoIds: string[], textIds: string[] } {
        const imageIds: string[] = [];
        const memoIds: string[] = [];
        const textIds: string[] = [];

        complaint.items.forEach(item => {
            if (item.type === 'image') {
                imageIds.push(item.id);
            } else if (item.type === 'recoding') {
                memoIds.push(item.id);
            } else if (item.type === 'text') {
                textIds.push(item.id);
            }
        });

        return { imageIds, memoIds, textIds };
    }

    /**
     * Sort complaint items by their order property
     * @param items Array of complaint items to sort
     * @returns Sorted array of complaint items
     */
    sortItemsByOrder<T extends { order: number }>(items: T[]): T[] {
        return [...items].sort((a, b) => a.order - b.order);
    }
}

// Export a singleton instance
export const complaintsItemDBService = new ComplaintsItemDB();