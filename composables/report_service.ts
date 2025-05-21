import { ReportService } from "~/services/report.service";
import { ReportsDB } from "~/services/reports_db";

let reportService: ReportService | undefined = undefined;

export function useReportService() {
    if (reportService) {
        return reportService;
    }

    const db = new ReportsDB();
    const logger = useLogger();
    const { t } = useI18n();
    reportService = new ReportService(db, logger, t);

    return reportService;
}
