import type { IMemo, MemoDto } from "./memo";
import type { IPicture, PictureDto } from "./pictures";

export interface IComplaint {
    readonly id: string;
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
    memos: MemoDto[];
    images: PictureDto[];
    order: number;
};

export function createComplaint(dto: Partial<ComplaintDto>): IComplaint {
    return new Complaint(dto);
}

class Complaint implements IComplaint {
    readonly id: string;
    memos: IMemo[];
    images: IPicture[];

    private _title: string;

    constructor(dto: Partial<ComplaintDto>) {
        this.id = dto.id ?? generateUUID();
        this._title = dto.title ?? '';
        this.memos = dto.memos ?? [];
        this.images = dto.images ?? [];
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
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
        };
    }

    toReactiveMutable(): Ref<ComplaintDto> {
        return ref(this.toDto());
    }
}