import { ServiceProvider } from "~/services/service_provider";

export default defineNuxtPlugin((nuxtApp) => {
    // const serviceProvider = new ServiceProvider();

    // provide("ComplaintsDB", complaintsDb);
    // provide("ComplaintsItemDB", complaintItemDb);
    // provide("ReportsDB", reportDb);

    // provide("ComplaintItemService", complaintItemService);
    // provide("ComplaintService", complaintService);
    // provide("ReportService", reportService);

    // serviceprovider.set(reportsdb, reportdb);
    // serviceprovider.set(complaintsdb, complaintsdb);
    // serviceprovider.set(complaintsitemdb, complaintitemdb);

    const serviceProvider = new ServiceProvider();

    nuxtApp.provide("serviceProvider", serviceProvider);
});
