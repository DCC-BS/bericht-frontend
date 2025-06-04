import type { ILogger } from "@dcc-bs/logger.bs.js";
import { ComplaintRecording, ComplaintText } from "~/models/compaint_item";
import type { IComplaint } from "~/models/complaint";
import type { Progress } from "~/models/progress";
import { type IReport, createReport } from "~/models/report";
import type { TitleResponse } from "~/models/title_response";
import { ComplaintService } from "./complaint.service";
import { ReportsDB } from "./queries/reports_db";
import { SpeechToTextService } from "./speech_to_text.service";

export class ReportService {
    static $injectKey = "reportService";
    static $inject = [
        ReportsDB,
        ComplaintService,
        SpeechToTextService,
        "logger",
        "translate",
    ];

    constructor(
        private readonly reportsDB: ReportsDB,
        private readonly complaintService: ComplaintService,
        private readonly speechToTextService: SpeechToTextService,
        private readonly logger: ILogger,
        private readonly translate: (key: string) => string,
    ) {}

    async getAllReports(): Promise<IReport[]> {
        return this.reportsDB
            .getAll()
            .then((reports) => reports.map((report) => createReport(report)));
    }

    async get(reportId: string): Promise<IReport> {
        return this.reportsDB
            .get(reportId)
            .then((report) => createReport(report));
    }

    async create(title: string): Promise<IReport> {
        const report = createReport({
            name: title,
        });

        await this.reportsDB.put(report.toDto());
        return report;
    }

    async delete(reportId: string): Promise<void> {
        const report = await this.reportsDB.get(reportId);
        if (!report) {
            this.logger.error("Report not found");
            return;
        }

        for (const complaint of report.complaints) {
            await this.complaintService.delete(complaint.id);
        }

        await this.reportsDB.delete(reportId);
    }

    async put(report: IReport): Promise<void> {
        await this.reportsDB.put(report.toDto());
    }

    async trasncribeMissingRecordings(
        report: IReport,
        progress: Progress,
    ): Promise<void> {
        const missingTranscriptions = report.complaints
            .flatMap((complaint) => complaint.items)
            .filter((item) => item instanceof ComplaintRecording && !item.text)
            .map((item) => item as ComplaintRecording);

        const n = missingTranscriptions.length;

        if (n > 0) {
            progress.update(
                this.translate("report.transcribing_recordings"),
                0,
            );
        }

        for (const item of missingTranscriptions) {
            try {
                const text = await this.speechToTextService.transcribeAudio(
                    item.audio,
                );
                item.text = text;
            } catch (error) {
                this.logger.error("Error transcribing audio", error);
            }

            progress.update(
                this.translate("report.transcribing_recordings"),
                (n - missingTranscriptions.length) / n,
            );
        }
    }

    async generateTitle(complaint: IComplaint, index?: number): Promise<void> {
        const type = this.translate(`complaint.${complaint.type}`);
        complaint.title = `${type} ${index ? `(${index + 1})` : ""}`;

        const text = complaint.items
            .map((item) => {
                if (item instanceof ComplaintText) {
                    return item.text;
                }
                if (item instanceof ComplaintRecording) {
                    return item.text;
                }
                return "";
            })
            .join("\n");

        if (text.length < 3) {
            return;
        }

        try {
            const response = (await $fetch("/api/title", {
                body: {
                    text: text,
                },
                method: "POST",
            })) as TitleResponse;

            if (response) {
                complaint.title = `${type}: ${response.title.trim()}`;
            } else {
                this.logger.error("Failed to generate title", response);
            }
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error("Error generating title", error.message);
            } else {
                this.logger.error("Error generating title", error);
            }
        }
    }

    async generateTitles(report: IReport, progress: Progress): Promise<void> {
        let i = 1;
        const n = report.complaints.length;

        progress.update(this.translate("report.generating_titles"), 0);

        for (const complaint of report.complaints) {
            if (!complaint.title.includes(":")) {
                await this.generateTitle(complaint, i++);
            }

            progress.update(this.translate("report.generating_titles"), i / n);
        }
    }
}
