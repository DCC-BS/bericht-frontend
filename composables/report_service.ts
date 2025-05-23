import type { IReport } from "~/models/report";
import { ReportService } from "~/services/report.service";

export function useReportService() {
    const logger = useLogger();
    const reportService = useService(ReportService);

    async function createReport(title: string) {
        return await reportService.create(title);
    }

    async function updateReport(report: IReport) {
        await reportService.put(report);
    }

    async function removeReport(reportId: string) {
        await reportService.delete(reportId);
    }

    async function getAllReports() {
        return reportService.getAllReports();
    }

    return { createReport, removeReport, getAllReports, updateReport };
}
