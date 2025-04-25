export interface IPicture {
    readonly id: string;
    image: Blob;
}

export type PictureDto = {
    id: string;
    image: Blob;
};