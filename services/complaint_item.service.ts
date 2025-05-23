import type { ILogger } from "@dcc-bs/logger.bs.js";
import {
    type IComplaintItem,
    createComplaintItem,
} from "~/models/compaint_item";
import type { ComplaintsItemDB } from "./queries/complaints_item_db";

export class ComplaintItemService {
    static $injectKey = "ComplaintItemService";

    constructor(
        private readonly db: ComplaintsItemDB,
        private readonly logger: ILogger,
    ) {}

    async get(complaintItemId: string): Promise<IComplaintItem> {
        return this.db
            .get(complaintItemId)
            .then((complaintItem) => createComplaintItem(complaintItem));
    }

    async put(complaintItem: IComplaintItem): Promise<void> {
        const dto = deepToRaw(complaintItem.toDto());
        await this.db.put(dto);
    }

    async delete(complaintItemId: string): Promise<void> {
        const complaintItem = await this.db.get(complaintItemId);
        if (!complaintItem) {
            this.logger.error("Complaint item not found");
            return;
        }

        await this.db.delete(complaintItemId);
    }
}
