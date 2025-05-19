import type { IMemo, MemoDto } from "./memo";
import type { IPicture, PictureDto } from "./pictures";

export type ComplaintType = "finding" | "action";


export interface IComplaint {
    readonly id: string;
    
    type: ComplaintType;
    memos: IMemo[];
    images: IPicture[];

    title: string;

    addMemo(memo: Omit<IMemo, "id" | "order">): void;
    removeMemo(index: number): void;

    addImage(image: Blob): void;
    removeImage(index: number): void;

    toDto(): ComplaintDto;

    toReactiveMutable(): Ref<ComplaintDto>;
}

export type ComplaintDto = {
    id: string;
    title: string;
    type: ComplaintType;
    subtitle1: string;
    subtitle2: string;
    memos: MemoDto[];
    images: PictureDto[];
    order: number;
};

export function createComplaint(dto: Partial<ComplaintDto>): IComplaint {
    return new Complaint(dto);
}

class Complaint implements IComplaint {
    readonly id: string;
    type: ComplaintType;
    memos: IMemo[];
    images: IPicture[];
    order: number;

    private _title: string;
    private _subtitle1: string;
    private _subtitle2: string;

    constructor(dto: Partial<ComplaintDto>) {
        this.id = dto.id ?? generateUUID();
        this.type = dto.type ?? "finding";
        this._title = dto.title ?? '';
        this.memos = dto.memos ?? [];
        this.images = dto.images ?? [];
        this._subtitle1 = dto.subtitle1 ?? '';
        this._subtitle2 = dto.subtitle2 ?? '';
        this.order = dto.order ?? 0;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get subtitle1(): string {
        return this._subtitle1;
    }

    set subtitle1(value: string) {
        this._subtitle1 = value;
    }

    get subtitle2(): string {
        return this._subtitle2;
    }

    set subtitle2(value: string) {
        this._subtitle2 = value;
    }

    addMemo(memo: Omit<IMemo, "id" | "order">): void {
        this.memos.push({ ...memo, id: generateUUID(), order: this.memos.length });
    }

    removeMemo(index: number): void {
        if (index >= 0 && index < this.memos.length) {
            this.memos.splice(index, 1);
        }
    }

    addImage(image: Blob): void {
        this.images.push({ id: generateUUID(), image });
    }

    removeImage(index: number): void {
        if (index >= 0 && index < this.images.length) {
            this.images.splice(index, 1);
        }
    }

    toDto(): ComplaintDto {
        return {
            id: this.id,
            title: this.title,
            memos: this.memos,
            images: this.images,
            type: this.type,
            subtitle1: this.subtitle1,
            subtitle2: this.subtitle2,
            order: this.order,
        };
    }

    toReactiveMutable(): Ref<ComplaintDto> {
        return ref(this.toDto());
    }
}