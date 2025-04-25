export interface IMemo {
    readonly id: string;
    order: number;
    audio: Blob;
    text: string;
}

export type MemoDto = {
    id: string;
    order: number;
    audio: Blob;
    text: string;
}