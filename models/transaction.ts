export class Transaction {
    // Using NodeJS.Timeout type for the setTimeout return value
    readonly timeoutId: NodeJS.Timeout;

    constructor(
        public readonly action: () => Promise<void>,
        public readonly timeout: number = 10000,
        public readonly onComplete?: (t: Transaction) => void,
    ) {
        this.timeoutId = setTimeout(() => {
            this.action();
            this.onComplete?.(this);
        }, this.timeout);
    }

    cancel(): void {
        clearTimeout(this.timeoutId);
    }

    submit(): void {
        this.cancel();
        this.action();
        this.onComplete?.(this);
    }
}
