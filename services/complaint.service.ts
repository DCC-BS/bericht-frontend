import type { ILogger } from "@dcc-bs/logger.bs.js";
import { type IComplaint, createComplaint } from "~/models/complaint";
import type { ComplaintsDB } from "./complaints_db";

export class ComplaintService {
    constructor(
        private readonly db: ComplaintsDB,
        private readonly logger: ILogger,
    ) {}

    async get(complaintId: string): Promise<IComplaint> {
        return this.db
            .getComplaint(complaintId)
            .then((complaint) => createComplaint(complaint));
    }

    async put(complaint: IComplaint): Promise<void> {
        await this.db.storeComplaint(deepToRaw(complaint.toDto()));
    }

    async delete(complaintId: string): Promise<void> {
        const complaint = await this.db.getComplaint(complaintId);
        if (!complaint) {
            this.logger.error("Complaint not found");
            return;
        }

        await this.db.deleteComplaint(complaintId);
    }
}
