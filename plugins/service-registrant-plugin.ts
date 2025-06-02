import { ComplaintService } from "~/services/complaint.service";
import { ComplaintItemService } from "~/services/complaint_item.service";
import { NotificationService } from "~/services/notification.service";
import { ComplaintsDB } from "~/services/queries/complaints_db";
import { ComplaintsItemDB } from "~/services/queries/complaints_item_db";
import { DatabaseService } from "~/services/queries/database_service";
import { ReportsDB } from "~/services/queries/reports_db";
import { ReportService } from "~/services/report.service";
import { SpeechToTextService } from "~/services/speech_to_text.service";

export default defineNuxtPlugin((nuxtApp) => {
    const orchestrator = new ServiceOrchestrator();

    orchestrator.setup((builder) => {
        const logger = useLogger();
        const { t } = useI18n();
        const toast = useToast();

        builder.registerInstance("translate", t);
        builder.registerInstance("logger", logger);
        builder.registerInstance("toast", toast.add);

        builder.register(DatabaseService);
        builder.register(ComplaintsDB);
        builder.register(ComplaintsItemDB);
        builder.register(ReportsDB);

        builder.register(ComplaintItemService);
        builder.register(ComplaintService);
        builder.register(ReportService);

        builder.register(SpeechToTextService);
        builder.register(NotificationService);
    });

    nuxtApp.provide("serviceOrchestrator", orchestrator);
});
