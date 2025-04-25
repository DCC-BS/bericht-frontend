import type { ILogger } from "@dcc-bs/logger.bs.js";
import type { ReportsDB } from "./reports_db";
import { type IReport, createReport } from "~/models/report";
import type { TitleResponse } from "~/models/title_response";

export class ReportService {
    constructor(
        private readonly db: ReportsDB,
        private readonly logger: ILogger,
    ) {}

    async getAllReports(): Promise<IReport[]> {
        return this.db.getAll();
    }

    async getReport(reportId: string): Promise<IReport> {
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

    async generateTitles(report: IReport): Promise<void> {
        for (const complaint of report.complaints) {
            const text = complaint.memos.map((m) => m.text).join(" ");

            const response = await $fetch<TitleResponse>("/api/title", {
                body: {
                    text: text,
                },
                method: "POST",
            });

            if (response) {
                complaint.title = response.title;
            } else {
                this.logger.error("Failed to generate title");
            }
        }
    }
}
