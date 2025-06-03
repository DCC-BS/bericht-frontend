export type ProgressCallback = (progress: Progress) => void;

export class Progress {
    private _message = "";
    private _t = 0;
    private readonly progressCallback?: ProgressCallback;

    constructor(progressCallback?: ProgressCallback) {
        this.progressCallback = progressCallback;
    }

    get message(): string {
        return this._message;
    }

    get t(): number {
        return this._t;
    }

    update(message: string, t: number): void {
        this._message = message;
        this._t = t;

        this.progressCallback?.(this);
    }
}
