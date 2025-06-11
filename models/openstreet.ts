/**
 * Interface representing an address object from OpenStreetMap API
 */
interface OpenStreetAddress {
    house_number?: string;
    road?: string;
    suburb?: string;
    borough?: string;
    city?: string;
    state?: string;
    "ISO3166-2-lvl4"?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
}

/**
 * Interface representing a place response from OpenStreetMap API
 */
interface OpenStreetPlace {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    class: string;
    type: string;
    place_rank: number;
    importance: number;
    addresstype: string;
    name: string;
    display_name: string;
    address: OpenStreetAddress;
    boundingbox: [string, string, string, string];
}

export type { OpenStreetPlace, OpenStreetAddress };
