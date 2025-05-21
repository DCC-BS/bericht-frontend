import { createComplaintItem, type ComplaintItemDto, type IComplaintItem } from "./compaint_item";

export type ComplaintType = "finding" | "action";

export interface IComplaint {
    readonly id: string;

    type: ComplaintType;
    items: IComplaintItem[];

    title: string;

    addItem(item: Omit<ComplaintItemDto, "id" | "order">): IComplaintItem;
    removeItem(id: string): void;

    toDto(): ComplaintDto;

    toReactiveMutable(): Ref<ComplaintDto>;
}

export type ComplaintDto = {
    id: string;
    title: string;
    type: ComplaintType;
    items: ComplaintItemDto[];
    order: number;
};

export function createComplaint(dto: Partial<ComplaintDto>): IComplaint {
    return new Complaint(dto);
}

class Complaint implements IComplaint {
    readonly id: string;
    type: ComplaintType;
    items: IComplaintItem[];
    order: number;

    private _title: string;
    constructor(dto: Partial<ComplaintDto>) {
        this.id = dto.id ?? generateUUID();
        this.type = dto.type ?? "finding";
        this._title = dto.title ?? '';
        this.items = dto.items?.map(x => createComplaintItem(x)) ?? [];
        this.order = dto.order ?? 0;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    addItem(item: Omit<ComplaintItemDto, "id" | "order">): IComplaintItem {
        const complaintItem = createComplaintItem({ ...item, order: this.items.length, id: generateUUID() });
        this.items.push(complaintItem);
        return complaintItem;
    }

    removeItem(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
    }

    toDto(): ComplaintDto {
        return {
            id: this.id,
            title: this.title,
            items: this.items.map(item => item.toDto()),
            type: this.type,
            order: this.order,
        };
    }

    toReactiveMutable(): Ref<ComplaintDto> {
        return ref(this.toDto());
    }
}