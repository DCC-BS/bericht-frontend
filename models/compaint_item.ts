import type { IPicture, PictureDto } from "./pictures";

export type ComplaintItemType = "recording" | "text" | "image";

export interface IComplaintItem {
    readonly $type: ComplaintItemType;
    id: string;
    order: number;

    toDto(): ComplaintItemDto;
}

export function createComplaintItem(dto: ComplaintItemDto): IComplaintItem {
    switch (dto.type) {
        case "recording":
            if (!dto.audio) {
                throw new Error(
                    "Audio is required for recording complaint item",
                );
            }

            return new ComplaintRecording(
                dto.id,
                dto.order,
                dto.audio,
                dto.text ?? "",
            );
        case "text":
            if (!dto.text) {
                throw new Error("Text is required for text complaint item");
            }

            return new ComplaintText(dto.id, dto.order, dto.text);
        case "image":
            if (!dto.image) {
                throw new Error("Image is required for image complaint item");
            }

            return new ComplaintImage(dto.id, dto.order, dto.image);
        default:
            throw new Error("Unknown complaint item type");
    }
}

export class ComplaintText implements IComplaintItem {
    readonly $type: "text";

    constructor(
        public readonly id: string,
        public order: number,
        public text: string,
    ) {
        this.$type = "text";
    }

    toDto(): ComplaintItemDto {
        return {
            id: this.id,
            order: this.order,
            type: this.$type,
            text: this.text,
        };
    }
}

export class ComplaintRecording implements IComplaintItem {
    readonly $type: "recording";

    constructor(
        public readonly id: string,
        public order: number,
        public audio: Blob,
        public text: string,
    ) {
        this.$type = "recording";
    }

    toDto(): ComplaintItemDto {
        return {
            id: this.id,
            order: this.order,
            type: this.$type,
            audio: this.audio,
            text: this.text,
        };
    }
}

export class ComplaintImage implements IComplaintItem {
    readonly $type: "image";

    constructor(
        public readonly id: string,
        public order: number,
        public image: IPicture,
    ) {
        this.$type = "image";
    }

    toDto(): ComplaintItemDto {
        return {
            id: this.id,
            order: this.order,
            type: this.$type,
            image: this.image,
        };
    }
}

export type ComplaintItemDto = {
    id: string;
    order: number;
    type: ComplaintItemType;
    text?: string;
    audio?: Blob;
    image?: PictureDto;
};
