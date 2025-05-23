import { ComplaintService } from "~/services/complaint.service";
import { ComplaintItemService } from "~/services/complaint_item.service";
import { ComplaintsDB } from "~/services/queries/complaints_db";
import { ComplaintsItemDB } from "~/services/queries/complaints_item_db";
import { DatabaseService } from "~/services/queries/database_service";
import { ReportsDB } from "~/services/queries/reports_db";
import { ReportService } from "~/services/report.service";
import { ServiceProvider } from "~/services/service_provider";

export default defineNuxtPlugin((nuxtApp) => {
    const serviceProvider = new ServiceProvider();

    serviceProvider.setup((builder) => {
        const logger = useLogger();

        const databaseService = new DatabaseService();

        const complaintItemDb = new ComplaintsItemDB(databaseService);
        const complaintsDb = new ComplaintsDB(databaseService, complaintItemDb);
        const reportDb = new ReportsDB(databaseService, complaintsDb);

        const complaintItemService = new ComplaintItemService(
            complaintItemDb,
            logger,
        );
        const complaintService = new ComplaintService(
            complaintsDb,
            complaintItemService,
            logger,
        );
        const reportService = new ReportService(
            reportDb,
            complaintService,
            logger,
            (key: string) => key, // t
        );

        builder.registerInstance(ComplaintsDB, complaintsDb);
        builder.registerInstance(ComplaintsItemDB, complaintItemDb);
        builder.registerInstance(ReportsDB, reportDb);
        builder.registerInstance(ComplaintItemService, complaintItemService);
        builder.registerInstance(ComplaintService, complaintService);
        builder.registerInstance(ReportService, reportService);
        builder.registerInstance(DatabaseService, databaseService);
    });

    nuxtApp.provide("serviceProvider", serviceProvider);
});
