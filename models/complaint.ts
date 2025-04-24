export interface IComplaint {
    readonly id: string;
    readonly texts: readonly string[];
    readonly audioFiles: readonly Blob[];
    readonly images: readonly Blob[];

    title: string;

    addText(text: string): void;
    removeText(text: string): void;

    addAudioFile(audioFile: Blob): void;
    removeAudioFile(audioFile: Blob): void;

    addImage(image: Blob): void;
    removeImage(image: Blob): void;

    toDto(): ComplaintDto;
}

export type ComplaintDto = {
    id: string;
    title: string;
    texts: string[];
    audioFiles: Blob[];
    images: Blob[];
};

export function createComplaint(dto: Partial<ComplaintDto>): IComplaint {
    return new Complaint(dto);
}

class Complaint implements IComplaint {
    readonly id: string;
    texts: string[];
    audioFiles: Blob[];
    images: Blob[];

    private _title: string;

    constructor(dto: Partial<ComplaintDto>) {
        this.id = dto.id ?? generateUUID();
        this.texts = dto.texts ?? [];
        this.audioFiles = dto.audioFiles ?? [];
        this.images = dto.images ?? [];
        this._title = dto.title ?? '';
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    addText(text: string): void {
        this.texts.push(text);
    }

    removeText(text: string): void {
        this.texts = this.texts.filter((t) => t !== text);
    }

    addAudioFile(audioFile: Blob): void {
        this.audioFiles.push(audioFile);
    }

    removeAudioFile(audioFile: Blob): void {
        this.audioFiles = this.audioFiles.filter((f) => f !== audioFile);
    }

    addImage(image: Blob): void {
        this.images.push(image);
    }

    removeImage(image: Blob): void {
        this.images = this.images.filter((f) => f !== image);
    }

    toDto(): ComplaintDto {
        return {
            id: this.id,
            title: this.title,
            texts: this.texts,
            audioFiles: this.audioFiles,
            images: this.images,
        };
    }
}