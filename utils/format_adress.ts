import type { MapAdress } from "~/models/map";

export function formatAddress(address: MapAdress | undefined): string {
    if (!address) {
        return "";
    }

    return `${address.road ?? ""} ${address.house_number ?? ""}, ${address.postcode ?? ""} ${address.city ?? ""}`.trim();
}
