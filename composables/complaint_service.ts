import type { IComplaint } from "~/models/complaint";
import type { IReport } from "~/models/report";
import { ComplaintService } from "~/services/complaint.service";
import { ComplaintsDB } from "~/services/complaints_db";

let complaintService: ComplaintService | undefined = undefined;

export function useComplaintService(reportId: string) {
    const reportService = getReportService();
    const complaintService = getComplaintService();

    const currentReport = ref<IReport>();

    reportService.get(reportId).then((report) => {
        currentReport.value = report;
    });

    async function addComplaint(complaint: IComplaint) {
        if (!currentReport.value) {
            console.error("Report not found");
            return;
        }

        currentReport.value.addComplaint(complaint);
        await complaintService.put(complaint);
        await reportService.put(currentReport.value);
    }

    async function removeComplaint(complaintId: string) {
        if (!currentReport.value) {
            console.error("Report not found");
            return;
        }

        currentReport.value.removeComplaint(complaintId);
        await complaintService.delete(complaintId);
        await reportService.put(currentReport.value);
    }

    return { currentReport, addComplaint, removeComplaint };
}

export function getComplaintService() {
    if (complaintService) {
        return complaintService;
    }

    const db = new ComplaintsDB();
    const logger = useLogger();
    complaintService = new ComplaintService(db, logger);

    return complaintService;
}