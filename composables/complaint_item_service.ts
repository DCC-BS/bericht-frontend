import { ComplaintItemService } from "~/services/complaint_item.service";
import { ComplaintsItemDB } from "~/services/complaints_item_db";

let service: ComplaintItemService | undefined = undefined;

export function useComplaintItemService() {
	if (service) {
		return service;
	}

	const db = new ComplaintsItemDB();
	const logger = useLogger();
	service = new ComplaintItemService(db, logger);

	return service;
}