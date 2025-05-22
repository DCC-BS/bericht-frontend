import type { IComplaintItem } from "~/models/compaint_item";
import type { ComplaintItemInput, IComplaint } from "~/models/complaint";
import { Transaction } from "~/models/transaction";
import { ComplaintItemService } from "~/services/complaint_item.service";
import { ComplaintsItemDB } from "~/services/complaints_item_db";

let service: ComplaintItemService | undefined = undefined;

export function useComplaintItemService(itemid: string) {
    const logger = useLogger();
    const toast = useToast();
    const complaintItemService = getComplaintItemService();
    const complaintService = getComplaintService();

    const currentComplaint = ref<IComplaint>();

    complaintService.get(itemid).then((complaint) => {
        currentComplaint.value = complaint;
    });

    async function addItem(item: ComplaintItemInput) {
        if (!currentComplaint.value) {
            logger.error("Complaint not found");
            return;
        }

        const complaintItem = currentComplaint.value.addItem(item);

        await complaintItemService.put(complaintItem);
        await complaintService.put(currentComplaint.value);
    }

    async function updateItem(item: IComplaintItem) {
        if (!currentComplaint.value) {
            logger.error("Complaint not found");
            return;
        }

        currentComplaint.value.updateItem(item);
        await complaintItemService.put(item);
        await complaintService.put(currentComplaint.value);
    }

    function removeItem(item: IComplaintItem) {
        if (!currentComplaint.value) {
            logger.error("Complaint not found");
            return;
        }

        currentComplaint.value.removeItem(item.id);

        const transaction = new Transaction(
            () => executeRemoveItem(item, currentComplaint.value!.id),
            10_000,
        );

        toast.add({
            title: "Item deleted",
            icon: "i-lucide-trash-2",
            color: "error",
            orientation: "horizontal",
            close: false,
            duration: transaction.timeout,
            actions: [
                {
                    icon: "i-lucide-rotate-cw",
                    color: "neutral",
                    label: "Undo",
                    onClick: () => {
                        if (!currentComplaint.value) {
                            logger.error("Complaint not found");
                            return;
                        }

                        transaction.cancel();
                        currentComplaint.value.addItem(item.toDto());
                    },
                },
            ],
        });
    }

    async function executeRemoveItem(
        item: IComplaintItem,
        complaintId: string,
    ) {
        const complaint = await complaintService.get(complaintId);

        complaint.removeItem(item.id);
        await complaintItemService.delete(item.id);
        await complaintService.put(complaint);
    }

    return {
        addComplaintItem: addItem,
        removeComplaintItem: removeItem,
        updateComplaintItem: updateItem,
        currentComplaint,
    };
}

function getComplaintItemService() {
    if (service) {
        return service;
    }

    const db = new ComplaintsItemDB();
    const logger = useLogger();
    service = new ComplaintItemService(db, logger);

    return service;
}
