import type { IPicture, PictureDto } from "~/models/pictures";
import { IMAGES_STORE, databaseService } from "./database_service";

/**
 * Image object to be stored in the images store
 */
type StoredImage = {
    id: string;
    blob: Blob;
    reportId?: string; // Optional reference to the report
    createdAt: Date;
};

/**
 * Service for managing pictures in IndexedDB
 */
export class PicturesDB {
    /**
     * Get the database instance from the centralized database service
     * @returns Promise resolving to the database instance
     */
    private async getDb(): Promise<IDBDatabase> {
        return await databaseService.getDatabase();
    }

    /**
     * Save an image to the database
     * @param image The image blob to save
     * @param reportId Optional ID of the report this image belongs to
     * @returns The ID of the saved image
     */
    async storeImage(image: IPicture, reportId: string): Promise<number> {
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([IMAGES_STORE], "readwrite");
            const store = transaction.objectStore(IMAGES_STORE);

            const storedImage: StoredImage = {
                id: image.id,
                blob: image.image,
                reportId,
                createdAt: new Date(),
            };

            const request = store.put(storedImage);

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
    async getImageById(id: number): Promise<Blob | undefined> {
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([IMAGES_STORE], "readonly");
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
     * Delete all images associated with a specific report
     * @param reportId The ID of the report whose images should be deleted
     */
    async deleteImagesByReportId(reportId: string): Promise<void> {
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([IMAGES_STORE], "readwrite");
            const store = transaction.objectStore(IMAGES_STORE);
            const index = store.index("reportId");
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
     * Deletes images by their IDs
     * @param imageIds - Array of image IDs to delete
     */
    async deleteImages(imageIds: string[]): Promise<void> {
        if (imageIds.length === 0) {
            return;
        }

        const db = await this.getDb();

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([IMAGES_STORE], "readwrite");
            const store = transaction.objectStore(IMAGES_STORE);
            let completed = 0;
            let errors = 0;

            // Delete each image one by one
            for (const id of imageIds) {
                const request = store.delete(id);

                request.onsuccess = () => {
                    completed++;
                    if (completed + errors === imageIds.length) {
                        resolve();
                    }
                };

                request.onerror = () => {
                    console.error(
                        `Failed to delete image ${id}:`,
                        request.error,
                    );
                    errors++;
                    if (completed + errors === imageIds.length) {
                        resolve(); // Still resolve to continue with the operation
                    }
                };
            }

            // Handle empty array case
            if (imageIds.length === 0) {
                resolve();
            }
        });
    }
}

// Export a singleton instance
export const picturesDBService = new PicturesDB();
