import type { ILogger } from "@dcc-bs/logger.bs.js";
import {
    type IComplaintItem,
    createComplaintItem,
} from "~/models/compaint_item";
import { ComplaintsItemDB } from "./queries/complaints_item_db";

export class ComplaintItemService {
    static $injectKey = "complaintItemService";
    static $inject = [ComplaintsItemDB.$injectKey, "logger"];

    constructor(
        private readonly complaintsItemDB: ComplaintsItemDB,
        private readonly logger: ILogger,
    ) {}

    async get(complaintItemId: string): Promise<IComplaintItem> {
        return this.complaintsItemDB
            .get(complaintItemId)
            .then((complaintItem) => createComplaintItem(complaintItem));
    }

    async put(complaintItem: IComplaintItem): Promise<void> {
        const dto = deepToRaw(complaintItem.toDto());
        await this.complaintsItemDB.put(dto);
    }

    async delete(complaintItemId: string): Promise<void> {
        const complaintItem = await this.complaintsItemDB.get(complaintItemId);
        if (!complaintItem) {
            this.logger.error("Complaint item not found");
            return;
        }

        await this.complaintsItemDB.delete(complaintItemId);
    }
}
