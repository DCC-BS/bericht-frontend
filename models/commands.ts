import type { ICommand, IReversibleCommand } from "#build/types/commands";
import type { IComplaintItem } from "./compaint_item";

export type Cmds = "RemoveComplaintItemCommand" | "AddComplaintItemCommand";

export class RemoveComplaintItemCommand implements IReversibleCommand {
    readonly $type = "RemoveComplaintItemCommand";

    get $undoCommand(): ICommand | undefined {
        // lazy create undo command to prevent circular reference
        return new AddComplaintItemCommand(this.itemToRemove, this.complaintId);
    }

    constructor(
        public readonly itemToRemove: IComplaintItem,
        public readonly complaintId: string,
    ) {}
}

export class AddComplaintItemCommand implements IReversibleCommand {
    readonly $type = "AddComplaintItemCommand";

    get $undoCommand(): ICommand | undefined {
        // lazy create undo command to prevent circular reference
        return new RemoveComplaintItemCommand(this.itemToAdd, this.complaintId);
    }

    constructor(
        public readonly itemToAdd: IComplaintItem,
        public readonly complaintId: string,
    ) {}
}
