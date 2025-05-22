import { ComplaintService } from "~/services/complaint.service";
import { ComplaintsDB } from "~/services/complaints_db";

let complaintService: ComplaintService | undefined = undefined;

export function useComplaintService() {
    if (complaintService) {
        return complaintService;
    }

    const db = new ComplaintsDB();
    const logger = useLogger();
    complaintService = new ComplaintService(db, logger);

    return complaintService;
}
