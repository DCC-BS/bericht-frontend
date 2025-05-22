import type { ILogger } from "@dcc-bs/logger.bs.js";
import {
    type IComplaintItem,
    createComplaintItem,
} from "~/models/compaint_item";
import type { ComplaintsItemDB } from "./complaints_item_db";

export class ComplaintItemService {
    constructor(
        private readonly db: ComplaintsItemDB,
        private readonly logger: ILogger,
    ) {}

    async get(complaintItemId: string): Promise<IComplaintItem> {
        return this.db
            .getItem(complaintItemId)
            .then((complaintItem) => createComplaintItem(complaintItem));
    }

    async put(complaintItem: IComplaintItem): Promise<void> {
        const dto = deepToRaw(complaintItem.toDto());
        console.log("ComplaintItemService.put", dto);
        await this.db.storeItem(dto);
    }

    async delete(complaintItemId: string): Promise<void> {
        const complaintItem = await this.db.getItem(complaintItemId);
        if (!complaintItem) {
            this.logger.error("Complaint item not found");
            return;
        }

        await this.db.deleteItem(complaintItemId);
    }
}
