<script lang="ts" setup>
import type { MapAdress } from "~/models/map";
import { MapService } from "~/services/map.service";

const mapService = useService(MapService);
const { t } = useI18n();

const address = defineModel<MapAdress>({
    default: {
        latitude: Number.POSITIVE_INFINITY,
        longitude: Number.POSITIVE_INFINITY,
        address: undefined,
        city: undefined,
        country: undefined,
    },
});

const isGeolocationSupported = computed(
    () => Number.isFinite(latitude.value) && Number.isFinite(longitude.value),
);

const isLoading = ref(true);
const latitude = ref(Number.POSITIVE_INFINITY);
const longitude = ref(Number.POSITIVE_INFINITY);

// Debouncing variables for API rate limiting
const debounceTimer = ref<NodeJS.Timeout>();
const debounceDelay = ref(300); // Initial delay in milliseconds
const maxDelay = ref(2000); // Maximum delay in milliseconds
const delayIncrement = ref(200); // Delay increment for each successive call

onMounted(() => {
    if (
        address.value.latitude &&
        address.value.longitude &&
        address.value.latitude !== Number.POSITIVE_INFINITY &&
        address.value.longitude !== Number.POSITIVE_INFINITY
    ) {
        latitude.value = address.value.latitude;
        longitude.value = address.value.longitude;
        isLoading.value = false;
    } else {
        updateCoordinates();
    }
});

/**
 * Cleanup debounce timer on component unmount to prevent memory leaks
 */
onUnmounted(() => {
    if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
        debounceTimer.value = undefined;
    }
});

const addressString = computed(() => formatAddress(address.value));

/**
 * Debounced function to update address information from coordinates
 * Prevents API spamming by implementing a delay that increases with successive calls
 */
function updateAddress(): void {
    if (!latitude.value || !longitude.value) {
        console.warn(
            "Latitude or longitude is undefined, cannot update address.",
        );
        return;
    }

    // Clear existing timer if a new call is received
    if (debounceTimer.value) {
        clearTimeout(debounceTimer.value);
        // Increase delay for successive calls (exponential backoff)
        debounceDelay.value = Math.min(
            debounceDelay.value + delayIncrement.value,
            maxDelay.value,
        );
    }

    // Set new timer with current delay
    debounceTimer.value = setTimeout(async () => {
        try {
            // Execute the API call after the debounce delay
            const location = await mapService.getLocationInfo(
                latitude.value,
                longitude.value,
            );
            address.value = location;

            // Reset delay after successful call
            debounceDelay.value = 300;
        } catch (error) {
            console.error("Error fetching location info:", error);
            // Reset delay even on error to prevent getting stuck with high delay
            debounceDelay.value = 300;
        } finally {
            // Clear the timer reference
            debounceTimer.value = undefined;
        }
    }, debounceDelay.value);
}

async function updateCoordinates() {
    isLoading.value = true;
    try {
        const coords = await mapService.getGeoLocation();

        latitude.value = coords.latitude;
        longitude.value = coords.longitude;

        updateAddress();
    } catch (error) {
        console.error("Error getting geolocation:", error);

        // Reset coordinates to default values if geolocation fails
        latitude.value = Number.POSITIVE_INFINITY;
        longitude.value = Number.POSITIVE_INFINITY;
    } finally {
        // Ensure loading state is reset
        isLoading.value = false;
    }
}

function onLatLngUpdate(latLng: { lat: number; lng: number }) {
    latitude.value = latLng.lat;
    longitude.value = latLng.lng;

    updateAddress();
}
</script>

<template>
    <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[400px] text-center">
        <!-- GPS Loading Animation Container -->
        <div class="relative mb-6">
            <!-- Pulsing GPS Icon -->
            <div class="relative">
                <!-- Animated pulse rings -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-32 h-32 rounded-full border-2 border-blue-400 animate-ping opacity-20"></div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div
                        class="w-24 h-24 rounded-full border-2 border-blue-500 animate-ping opacity-40 animation-delay-150">
                    </div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div
                        class="w-16 h-16 rounded-full border-2 border-blue-600 animate-ping opacity-60 animation-delay-300">
                    </div>
                </div>

                <!-- GPS Icon -->
                <div
                    class="relative w-20 h-20 mx-auto flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg">
                    <svg class="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                    </svg>
                </div>

                <!-- Orbiting satellites -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-40 h-40 animate-spin-slow">
                        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                        <div class="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2">
                            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-500"></div>
                        </div>
                        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-1000"></div>
                        </div>
                        <div class="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-1500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Text with Typing Animation -->
        <div class="text-lg font-medium text-gray-700 mb-2">
            <span class="inline-block animate-pulse">{{ t('map.locatingGpsPosition') }}</span>
            <span class="animate-bounce inline-block ml-1">.</span>
            <span class="animate-bounce inline-block animation-delay-200">.</span>
            <span class="animate-bounce inline-block animation-delay-400">.</span>
        </div>

        <!-- Status Text -->
        <p class="text-sm text-gray-500 max-w-xs">
            {{ t('map.allowLocationAccess') }}
        </p>
    </div>
    <div v-else>
        <div v-if="!isGeolocationSupported" class="text-red-500">
            {{ t('map.geolocationNotSupported') }}
        </div>
        <div v-else class="w-full  mb-5">
            <div class="text-center mb-2">
                <p>{{ t('map.address') }}: {{ addressString }}</p>
            </div>

            <LMap class="w-full" :style="{ height: '400px' }" :zoom="20" :center="[latitude, longitude]">
                <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="Farbig">
                </LTileLayer>
                <LMarker @update:latLng="onLatLngUpdate" draggable :lat-lng="[latitude, longitude]">
                </LMarker>
            </LMap>
        </div>

        <div class="flex justify-center w-full gap-2">
            <UButton color="secondary" @click="updateCoordinates">
                {{ t('map.getGpsPosition') }}
            </UButton>

            <UButton>
                {{ t('map.done') }}
            </UButton>
        </div>
    </div>
</template>

<style scoped>
/* Custom animation delays */
.animation-delay-150 {
    animation-delay: 150ms;
}

.animation-delay-200 {
    animation-delay: 200ms;
}

.animation-delay-300 {
    animation-delay: 300ms;
}

.animation-delay-400 {
    animation-delay: 400ms;
}

.animation-delay-500 {
    animation-delay: 500ms;
}

.animation-delay-1000 {
    animation-delay: 1000ms;
}

.animation-delay-1500 {
    animation-delay: 1500ms;
}

/* Slow spin animation for satellites */
@keyframes spin-slow {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.animate-spin-slow {
    animation: spin-slow 8s linear infinite;
}


/* Enhanced pulse animation */
@keyframes enhanced-pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(1.05);
    }
}

.animate-enhanced-pulse {
    animation: enhanced-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>