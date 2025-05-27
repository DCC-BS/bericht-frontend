import type { ILogger } from "@dcc-bs/logger.bs.js";
import { type IComplaint, createComplaint } from "~/models/complaint";
import { ComplaintItemService } from "./complaint_item.service";
import { ComplaintsDB } from "./queries/complaints_db";

export class ComplaintService {
    static $injectKey = "complaintService";
    static $inject = [
        ComplaintsDB.$injectKey,
        ComplaintItemService.$injectKey,
        "logger",
    ];

    constructor(
        private readonly complaintsDB: ComplaintsDB,
        private readonly complaintItemService: ComplaintItemService,
        private readonly logger: ILogger,
    ) {}

    async get(complaintId: string): Promise<IComplaint> {
        return this.complaintsDB
            .get(complaintId)
            .then((complaint) => createComplaint(complaint));
    }

    async put(complaint: IComplaint): Promise<void> {
        await this.complaintsDB.put(deepToRaw(complaint.toDto()));
    }

    async delete(complaintId: string): Promise<void> {
        const complaint = await this.complaintsDB.get(complaintId);
        if (!complaint) {
            this.logger.error("Complaint not found");
            return;
        }

        for (const item of complaint.items) {
            await this.complaintItemService.delete(item.id);
        }

        await this.complaintsDB.delete(complaintId);
    }
}
