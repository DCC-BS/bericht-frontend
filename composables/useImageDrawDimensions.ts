import { useWindowSize } from "@vueuse/core";
import { type Ref, computed, onMounted, onUnmounted, ref, watch } from "vue";

/**
 * Interface for image dimensions configuration
 */
interface ImageDimensions {
    width: number;
    height: number;
    x: number;
    y: number;
    scale: number;
}

/**
 * Interface for stage configuration
 */
interface StageConfig {
    width: number;
    height: number;
    draggable: boolean;
}

/**
 * Composable for handling image dimensions and stage configuration
 * in the image drawing component
 */
export function useImageDrawDimensions() {
    const { width } = useWindowSize();

    /**
     * Check if device is mobile based on screen width
     */
    const isMobile = computed(() => {
        return width.value < 768; // Mobile if width is less than 768px
    });

    // Create reactive stage config
    const stageConfig = ref<StageConfig>({
        width: window.innerWidth,
        height: window.innerHeight - 160, // Account for header (60px) and footer (100px)
        draggable: false,
    });

    // Add reactive refs for image dimensions
    const imageDimensions = ref<ImageDimensions>({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        scale: 1,
    });

    /**
     * Calculate image dimensions while preserving aspect ratio
     */
    function calculateImageDimensions(image: HTMLImageElement): void {
        if (!image) return;

        // Get the natural dimensions of the image
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        // Calculate aspect ratio
        const imageRatio = naturalWidth / naturalHeight;
        const containerRatio =
            stageConfig.value.width / stageConfig.value.height;

        let newWidth = 0;
        let newHeight = 0;
        let newX = 0;
        let newY = 0;

        // Determine dimensions based on aspect ratio comparison
        if (imageRatio > containerRatio) {
            // Image is wider than container (relative to height)
            newWidth = stageConfig.value.width;
            newHeight = newWidth / imageRatio;
            newY = (stageConfig.value.height - newHeight) / 2; // Center vertically
        } else {
            // Image is taller than container (relative to width)
            newHeight = stageConfig.value.height;
            newWidth = newHeight * imageRatio;
            newX = (stageConfig.value.width - newWidth) / 2; // Center horizontally
        }

        // Update the image dimensions
        imageDimensions.value = {
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
            scale: 1,
        };
    }

    /**
     * Update dimensions on window resize
     */
    function handleResize(): void {
        // Account for top and bottom UI elements
        const headerHeight = 60; // Height of the top bar
        const footerHeight = isMobile.value ? 100 : 80; // Height of the bottom toolbar

        stageConfig.value = {
            width: window.innerWidth,
            height: window.innerHeight - headerHeight - footerHeight,
            draggable: stageConfig.value.draggable,
        };
    }

    // Listen for window resize events
    onMounted(() => {
        window.addEventListener("resize", handleResize);
        // Initial size update based on current window size
        handleResize();
    });

    onUnmounted(() => {
        window.removeEventListener("resize", handleResize);
    });

    return {
        isMobile,
        stageConfig,
        imageDimensions,
        calculateImageDimensions,
        handleResize,
    };
}
