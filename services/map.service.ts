import type { MapAdress } from "~/models/map";
import type { OpenStreetPlace } from "~/models/openstreet";

type GeoLocation = {
    latitude: number;
    longitude: number;
};

export class MapService {
    static $injectKey = "MapService";
    static $inject = [];

    async getLocationInfo(
        latitude: number,
        longitude: number,
    ): Promise<MapAdress> {
        const resposne = await $fetch<OpenStreetPlace>(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}8&lon=${longitude}&format=json`,
        );

        return {
            house_number: resposne.address?.house_number,
            road: resposne.address?.road,
            postcode: resposne.address?.postcode,
            city: resposne.address?.city,
            latitude: latitude,
            longitude: longitude,
        };
    }

    async getGeoLocation(): Promise<GeoLocation> {
        if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported by this browser.");
        }

        return new Promise<GeoLocation>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({
                        latitude,
                        longitude,
                    });
                },
                (error) => {
                    reject(error);
                },
            );
        });
    }
}
