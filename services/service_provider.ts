export interface ServiceType<T> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    new (...args: any[]): T;

    $injectKey: string;
}

export type ServiceProviderBuilder = {
    register<T>(target: ServiceType<T>, instance: T): void;
};

type SetupFunction = (builder: ServiceProviderBuilder) => void;

export class ServiceProvider extends Map<string, unknown> {
    private setupFunction: SetupFunction | undefined = undefined;

    public register<T>(target: ServiceType<T>, instance: T): void {
        const key = target.$injectKey;
        if (this.has(key)) {
            throw new Error(`Service ${key} already registered`);
        }
        this.set(key, instance);
    }

    public resolve<T>(target: ServiceType<T>): T {
        this.init();

        const key = target.$injectKey;

        const ctorParamNames = getParamNames(target);

        const injections = ctorParamNames.map((name: string) => this.get(name));
        let instance = this.get(key);
        if (!instance) {
            instance = new target(...injections);
            this.set(key, instance);
        }

        return instance as T;
    }

    public setup<T>(setupFunction: SetupFunction): void {
        this.setupFunction = setupFunction;
    }

    public init() {
        if (this.size === 0 && this.setupFunction) {
            this.setupFunction(this);
        }
    }
}

function getParamNames<T>(fn: ServiceType<T>): string[] {
    const str = fn.toString();
    const params = str.match(/constructor\s*\(([^)]*)\)/)?.[1] || "";
    return params
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
}
