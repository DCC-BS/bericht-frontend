import type { ILogger } from "@dcc-bs/logger.bs.js";
import { type IReport, createReport } from "~/models/report";
import type { ComplaintService } from "./complaint.service";
import type { ReportsDB } from "./queries/reports_db";

export class ReportService {
    static $injectKey = "ReportService";

    constructor(
        private readonly db: ReportsDB,
        private readonly complaintService: ComplaintService,
        private readonly logger: ILogger,
        private readonly t: (key: string) => string,
    ) {}

    async getAllReports(): Promise<IReport[]> {
        return this.db
            .getAll()
            .then((reports) => reports.map((report) => createReport(report)));
    }

    async get(reportId: string): Promise<IReport> {
        return this.db.get(reportId).then((report) => createReport(report));
    }

    async create(title: string): Promise<IReport> {
        const report = createReport({
            name: title,
        });

        await this.db.put(report.toDto());
        return report;
    }

    async delete(reportId: string): Promise<void> {
        const report = await this.db.get(reportId);
        if (!report) {
            this.logger.error("Report not found");
            return;
        }

        for (const complaint of report.complaints) {
            await this.complaintService.delete(complaint.id);
        }

        await this.db.delete(reportId);
    }

    async put(report: IReport): Promise<void> {
        await this.db.put(report.toDto());
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
