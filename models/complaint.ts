import {
    type ComplaintItemDto,
    type IComplaintItem,
    createComplaintItem,
} from "./compaint_item";

type MakeOptional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export type ComplaintType = "finding" | "action";
export type ComplaintItemInput = MakeOptional<ComplaintItemDto, "id" | "order">;

export interface IComplaint {
    readonly id: string;

    type: ComplaintType;
    items: IComplaintItem[];

    title: string;

    addItem(item: ComplaintItemInput): IComplaintItem;
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
        this._title = dto.title ?? "";
        this.items =
            dto.items
                ?.map((x) => createComplaintItem(x))
                .sort((a, b) => a.order - b.order) ?? [];
        this.order = dto.order ?? 0;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    addItem(item: ComplaintItemInput): IComplaintItem {
        const newItem = {
            ...item,
            order: this.items.length,
            id: generateUUID(),
        };

        if (item.id) {
            newItem.id = item.id;
        }

        if (item.order !== undefined) {
            newItem.order = item.order;
        }

        const complaintItem = createComplaintItem(newItem);
        this.items.push(complaintItem);
        this.items = this.items.sort((a, b) => a.order - b.order);
        return complaintItem;
    }

    removeItem(id: string): void {
        this.items = this.items.filter((item) => item.id !== id);
    }

    toDto(): ComplaintDto {
        return {
            id: this.id,
            title: this.title,
            items: this.items.map((item) => item.toDto()),
            type: this.type,
            order: this.order,
        };
    }

    toReactiveMutable(): Ref<ComplaintDto> {
        return ref(this.toDto());
    }
}
