import type { ILogger } from "@dcc-bs/logger.bs.js";
import { type IComplaint, createComplaint } from "~/models/complaint";
import type { ComplaintItemService } from "./complaint_item.service";
import type { ComplaintsDB } from "./queries/complaints_db";

export class ComplaintService {
    static $injectKey = "ComplaintService";

    constructor(
        private readonly db: ComplaintsDB,
        private readonly itemService: ComplaintItemService,
        private readonly logger: ILogger,
    ) {}

    async get(complaintId: string): Promise<IComplaint> {
        return this.db
            .get(complaintId)
            .then((complaint) => createComplaint(complaint));
    }

    async put(complaint: IComplaint): Promise<void> {
        await this.db.put(deepToRaw(complaint.toDto()));
    }

    async delete(complaintId: string): Promise<void> {
        const complaint = await this.db.get(complaintId);
        if (!complaint) {
            this.logger.error("Complaint not found");
            return;
        }

        for (const item of complaint.items) {
            await this.itemService.delete(item.id);
        }

        await this.db.delete(complaintId);
    }
}
