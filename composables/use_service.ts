import { ComplaintService } from "~/services/complaint.service";
import { ComplaintItemService } from "~/services/complaint_item.service";
import { ComplaintsDB } from "~/services/queries/complaints_db";
import { ComplaintsItemDB } from "~/services/queries/complaints_item_db";
import { DatabaseService } from "~/services/queries/database_service";
import { ReportsDB } from "~/services/queries/reports_db";
import { ReportService } from "~/services/report.service";
import type { ServiceProvider, ServiceType } from "~/services/service_provider";

export function useService<T>(target: ServiceType<T>): T {
    const nuxtApp = useNuxtApp();
    const serviceProvider = nuxtApp.$serviceProvider as ServiceProvider;

    if (serviceProvider.size === 0) {
        registerServices(serviceProvider);
    }

    return serviceProvider.resolve(target);
}

function registerServices(serviceProvider: ServiceProvider) {
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

    serviceProvider.register(ComplaintsDB, complaintsDb);
    serviceProvider.register(ComplaintsItemDB, complaintItemDb);
    serviceProvider.register(ReportsDB, reportDb);
    serviceProvider.register(ComplaintItemService, complaintItemService);
    serviceProvider.register(ComplaintService, complaintService);
    serviceProvider.register(ReportService, reportService);
    serviceProvider.register(DatabaseService, databaseService);
}
