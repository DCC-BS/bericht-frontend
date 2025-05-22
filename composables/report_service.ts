import type { IReport } from "~/models/report";
import { ReportService } from "~/services/report.service";
import { ReportsDB } from "~/services/reports_db";

let reportService: ReportService | undefined = undefined;

export function useReportService() {
    const logger = useLogger();
    const reportService = getReportService();

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

export function getReportService() {
    if (reportService) {
        return reportService;
    }

    const db = new ReportsDB();
    const logger = useLogger();
    const { t } = useI18n();
    reportService = new ReportService(db, logger, t);

    return reportService;
}
