import type { ILogger } from "@dcc-bs/logger.bs.js";
import type { ReportsDB } from "./reports_db";
import { type IReport, createReport } from "~/models/report";

export class ReportService {
    constructor(private readonly db: ReportsDB, private readonly logger: ILogger) { }

    async getAllReports(): Promise<any[]> {
        return this.db.getAll();
    }

    async getReport(reportId: string): Promise<any> {
        return this.db.getById(reportId);
    }

    async createReport(title: string): Promise<IReport> {
        const report = createReport({
            name: title,
        });

        this.db.saveReport(report);
        return report;
    }

    async updateReport(report: IReport): Promise<void> {
        await this.db.saveReport(report);
    }
}