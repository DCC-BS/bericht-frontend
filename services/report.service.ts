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

        await this.db.saveReport(report);
        return report;
    }

    async deleteReport(reportId: string): Promise<void> {
        const report = await this.db.getById(reportId);
        if (!report) {
            this.logger.error("Report not found");
            return;
        }

        await this.db.delete(reportId);
    }

    async updateReport(report: IReport): Promise<void> {
        await this.db.saveReport(report);
    }

    async generateTitles(report: IReport): Promise<void> {
        let i = 0;
        for (const complaint of report.complaints) {
            complaint.title = `Be­an­stan­dung ${i++}`;

            // const text = complaint.memos.map((m) => m.text).join(" ");

            // const response = await $fetch<TitleResponse>("/api/title", {
            //     body: {
            //         text: text,
            //     },
            //     method: "POST",
            // });

            // if (response) {
            //     complaint.title = response.title;
            // } else {
            //     this.logger.error("Failed to generate title");
            // }
        }
    }
}
