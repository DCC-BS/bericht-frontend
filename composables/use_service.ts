import type { ServiceProvider, ServiceType } from "~/services/service_provider";

export function useService<T>(target: ServiceType<T>): T {
    const nuxtApp = useNuxtApp();
    const serviceProvider = nuxtApp.$serviceProvider as ServiceProvider;

    if (serviceProvider.size === 0) {
        serviceProvider.init();
    }

    return serviceProvider.resolve(target);
}
