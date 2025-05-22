import {
    AddComplaintItemCommand,
    RemoveComplaintItemCommand,
} from "~/models/commands";
import type { IComplaintItem } from "~/models/compaint_item";
import type { ComplaintItemInput, IComplaint } from "~/models/complaint";
import { Transaction } from "~/models/transaction";
import { ComplaintItemService } from "~/services/complaint_item.service";
import { ComplaintsItemDB } from "~/services/complaints_item_db";

let service: ComplaintItemService | undefined = undefined;

export function useComplaintItemService(itemid: string) {
    const { executeCommand, onCommand } = useCommandBus();
    const logger = useLogger();
    const toast = useToast();
    const complaintItemService = getComplaintItemService();
    const complaintService = useComplaintService();

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
        await executeCommand(
            new AddComplaintItemCommand(
                complaintItem,
                currentComplaint.value?.id,
            ),
        );
    }

    function removeItem(item: IComplaintItem) {
        if (!currentComplaint.value) {
            logger.error("Complaint not found");
            return;
        }

        currentComplaint.value.removeItem(item.id);
        const command = new RemoveComplaintItemCommand(
            item,
            currentComplaint.value?.id,
        );
        const transaction = new Transaction(
            () => executeCommand(command),
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

    onCommand<RemoveComplaintItemCommand>(
        "RemoveComplaintItemCommand",
        async (command: RemoveComplaintItemCommand) => {
            if (!currentComplaint.value) {
                logger.error("Complaint not found");
                return;
            }

            const item = command.itemToRemove;
            const complaint = await complaintService.get(command.complaintId);

            complaint.removeItem(item.id);
            await complaintItemService.delete(item.id);
            await complaintService.put(complaint);
        },
    );

    onCommand<AddComplaintItemCommand>(
        "AddComplaintItemCommand",
        async (command: AddComplaintItemCommand) => {
            if (!currentComplaint.value) {
                logger.error("Complaint not found");
                return;
            }

            const item = command.itemToAdd;
            const complaint = await complaintService.get(command.complaintId);
            complaint.addItem(item.toDto());

            await complaintItemService.put(item);
            await complaintService.put(complaint);
        },
    );

    return {
        addComplaintItem: addItem,
        removeComplaintItem: removeItem,
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
