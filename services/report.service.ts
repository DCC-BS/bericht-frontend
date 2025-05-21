import type { ILogger } from "@dcc-bs/logger.bs.js";
import type { ReportsDB } from "./reports_db";
import { type IReport, createReport } from "~/models/report";

export class ReportService {
    constructor(
        private readonly db: ReportsDB,
        private readonly logger: ILogger,
        private readonly t: (key: string) => string,
    ) {}

    async getAllReports(): Promise<IReport[]> {
        return this.db
            .getAll()
            .then((reports) => reports.map((report) => createReport(report)));
    }

    async getReport(reportId: string): Promise<IReport> {
        return this.db.getById(reportId).then((report) => createReport(report));
    }

    async createReport(title: string): Promise<IReport> {
        const report = createReport({
            name: title,
        });

        await this.db.storeReport(report.toDto());
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
        await this.db.storeReport(report.toDto());
    }

    async generateTitles(report: IReport): Promise<void> {
        let i = 1;
        for (const complaint of report.complaints) {
            const type = this.t(`complaint.${complaint.type}`);
            complaint.title = `${type} ${i++}`;

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
