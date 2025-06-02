<script setup lang="ts">
import type { KonvaEventObject } from 'konva/lib/Node';
import { useImage } from 'vue-konva';
import type Konva from 'konva';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Stage } from 'konva/lib/Stage';
import { usePinch, useDrag } from '@vueuse/gesture';

interface InputProps {
    src: string;
}

const props = defineProps<InputProps>();
const emit = defineEmits(['save', 'cancel']);

/**
 * Handle pinch gesture for zooming
 * Uses the @vueuse/gesture library for better gesture handling
 */
usePinch((state) => {
    // Extract gesture data
    const {
        da, // [d,a] absolute distance and angle of the two pointers
        origin, // coordinates of the center between the two touch events
        event,
        offset,
        delta
    } = state;

    // Prevent browser default behaviors
    event?.preventDefault();

    // Extract distance from da array (first element)
    const distance = da ? da[0] : 0;

    if (!lastDist.value) {
        // First interaction - just store the distance
        lastDist.value = distance;
        return;
    }

    // Calculate scale change using direct ratio for more responsive zoom
    const pinchRatio = distance / lastDist.value;

    // Only apply zoom if there's a significant change
    if (Math.abs(pinchRatio - 1) > 0.02) {
        const oldScale = stageScale.value;

        // Apply new scale with proper ratio
        const newScale = oldScale * pinchRatio;

        // Limit min/max scale
        const limitedScale = Math.max(0.5, Math.min(newScale, 4));

        // Apply scale
        stageScale.value = limitedScale;

        // Apply movement to center point if origin is available
        if (origin) {
            const stage = stageRef.value?.getStage();
            if (stage) {
                // Get pointer position in stage coordinates
                const pointerPos = {
                    x: origin[0],
                    y: origin[1]
                };

                // Calculate the position difference caused by scaling
                const mousePointTo = {
                    x: (pointerPos.x - stagePosition.value.x) / oldScale,
                    y: (pointerPos.y - stagePosition.value.y) / oldScale
                };

                // Adjust position to keep pinch center stationary
                stagePosition.value = {
                    x: pointerPos.x - mousePointTo.x * limitedScale,
                    y: pointerPos.y - mousePointTo.y * limitedScale
                };
            }
        }
    }

    // Update last distance value for next frame
    lastDist.value = distance;

    // Reset drawing state during pinch operations
    isDrawing.value = false;
}, {
    passive: false,
    domTarget: window, // Attach to window for more reliable gesture detection
    eventOptions: { capture: true }
});

/**
 * Handle drag gesture for panning the canvas
 * Uses the @vueuse/gesture library for better gesture handling
 */
useDrag(({ active, first, last, delta: [dx, dy] }) => {
    // Only activate dragging when in pan mode
    if (tool.value !== 'pan') return;

    // Update dragging state
    isDragging.value = active;
    const speed = 1; // Speed multiplier for dragging

    if (first) {
        // Start of drag - can perform initialization if needed
        console.log('Drag started');
    } else if (active) {
        console.log('Dragging', { dx, dy });

        // During drag - update position
        stagePosition.value = {
            x: stagePosition.value.x + dx * speed,
            y: stagePosition.value.y + dy * speed
        };
    }

    if (last) {
        // End of drag
        console.log('Drag ended');
    }
}, {
    passive: false,
    domTarget: window,
    eventOptions: { capture: true }
});

type LineType = {
    points: number[];
    color: string;
};
type ToolType = 'brush' | 'eraser' | 'pan';

const [image] = useImage(props.src);

/**
 * Array of color objects for the color picker
 * Each color has a value and a label for accessibility
 */
const commonColors = [
    { value: '#FF0000', label: 'Red' },
    { value: '#00FF00', label: 'Green' },
    { value: '#0000FF', label: 'Blue' },
    { value: '#FFFF00', label: 'Yellow' },
    { value: '#FFA500', label: 'Orange' },
    { value: '#800080', label: 'Purple' },
    { value: '#FFC0CB', label: 'Pink' },
    { value: '#000000', label: 'Black' },
    { value: '#FFFFFF', label: 'White' },
];

/**
 * Check if device is mobile based on screen width
 */
const isMobile = ref(false);

/**
 * Update mobile state based on screen size
 */
function updateMobileState(): void {
    isMobile.value = window?.innerWidth < 768;
}

// Create reactive stage config
const stageConfig = ref({
    width: window.innerWidth,
    height: window.innerHeight - 160, // Account for header (60px) and footer (100px)
    draggable: false,
});

// Add reactive refs for image dimensions
const imageDimensions = ref({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    scale: 1
});

// State for zoom and pan functionality
const stageScale = ref(1);
const stagePosition = ref({ x: 0, y: 0 });
const lastCenter = ref<{ x: number, y: number }>();
const lastDist = ref<number>(0);
const stageRef = ref<{ getStage: () => Stage | null }>();
const isEdited = ref(false);
const isSaving = ref(false);

// The handlePinchZoom function has been replaced with the usePinch hook implementation

// Update dimensions on window resize
function handleResize(): void {
    // Account for top and bottom UI elements
    const headerHeight = 60; // Height of the top bar
    const footerHeight = isMobile.value ? 100 : 80; // Height of the bottom toolbar

    stageConfig.value = {
        width: window.innerWidth,
        height: window.innerHeight - headerHeight - footerHeight,
        draggable: stageConfig.value.draggable,
    };

    // Recalculate image dimensions on resize
    if (image.value) {
        calculateImageDimensions(image.value);
    }

    // Update mobile state
    updateMobileState();
}

/**
 * Calculate image dimensions while preserving aspect ratio
 */
function calculateImageDimensions(newImage: HTMLImageElement): void {
    if (!newImage) return;

    // Get the natural dimensions of the image
    const naturalWidth = newImage.naturalWidth;
    const naturalHeight = newImage.naturalHeight;

    // Calculate aspect ratio
    const imageRatio = naturalWidth / naturalHeight;
    const containerRatio = stageConfig.value.width / stageConfig.value.height;

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
        scale: 1
    };
}

// Calculate image dimensions when image loads or on resize
watch(image, (newImage) => {
    if (newImage) {
        calculateImageDimensions(newImage);
    }
}, { immediate: true });

// Listen for window resize events
onMounted(() => {
    window.addEventListener('resize', handleResize);
    updateMobileState();

    // Initial size update based on current window size
    handleResize();
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

const imageConfig = computed<Konva.ImageConfig>(() => ({
    image: image.value ?? new Image(),
    width: imageDimensions.value.width,
    height: imageDimensions.value.height,
    x: imageDimensions.value.x,
    y: imageDimensions.value.y
}));

const tool = ref<ToolType>('brush');
const lines = ref<LineType[]>([]);
const isDrawing = ref(false);
const selectedColor = ref(commonColors[0].value); // Default brush color
const eraserSize = ref(10); // Size of eraser hitbox in pixels
const cursorPosition = ref({ x: 0, y: 0 }); // Track cursor position for eraser visual

// State tracking for drag operations - used by useDrag hook
const isDragging = ref(false);


/**
 * Convert SVG from Konva stage to PNG image
 * @returns Promise that resolves with the data URL of the PNG image
 */
async function exportToPng(): Promise<Blob | undefined> {
    return new Promise((resolve) => {
        if (!stageRef.value) {
            return resolve(undefined);
        }

        console.log(stageRef.value);

        const stage = stageRef.value.getStage();

        if (!stage) {
            return resolve(undefined);
        }

        stage.toBlob({
            mimeType: 'image/png',
            pixelRatio: window.devicePixelRatio || 2, // Use device pixel ratio for better quality,
            callback: (blob: Blob | null) => {
                resolve(blob ?? undefined);
            }
        });
    });
}

/**
 * Save the current drawing and emit the result
 */
async function saveDrawing(): Promise<void> {
    isSaving.value = true;

    try {
        const blob = await exportToPng();
        if (blob) {
            emit('save', blob);
        }
    } catch (error) {
        console.error('Error exporting image:', error);
    } finally {
        isSaving.value = false;
    }
}

/**
 * Cancel the drawing and return to previous screen
 */
function cancelDrawing(): void {
    if (isEdited.value) {
        // Show confirmation dialog if changes were made
        if (window.confirm('Discard your changes?')) {
            emit('cancel');
        }
    } else {
        emit('cancel');
    }
}

/**
 * Calculate the distance between a point and a line segment
 * @param px Point x coordinate
 * @param py Point y coordinate
 * @param x1 Line segment start x
 * @param y1 Line segment start y
 * @param x2 Line segment end x
 * @param y2 Line segment end y
 * @returns The distance between the point and line segment
 */
function distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx: number;
    let yy: number;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point intersects with any line in the drawing
 * @param x Point x coordinate
 * @param y Point y coordinate
 * @param eraserDistance Maximum distance to consider as intersection
 * @returns Array of indices of intersected lines
 */
function findIntersectedLines(x: number, y: number, eraserDistance: number): number[] {
    const intersectedIndices: number[] = [];

    // Check each line for intersection
    lines.value.forEach((line, lineIndex) => {
        // Check each segment of the line
        for (let i = 0; i < line.points.length - 2; i += 2) {
            const x1 = line.points[i];
            const y1 = line.points[i + 1];
            const x2 = line.points[i + 2];
            const y2 = line.points[i + 3];

            // Calculate distance from point to line segment
            const distance = distanceToLineSegment(x, y, x1, y1, x2, y2);

            // If close enough to the line segment, consider it intersected
            if (distance < eraserDistance) {
                intersectedIndices.push(lineIndex);
                break; // No need to check further segments of this line
            }
        }
    });

    return intersectedIndices;
}

const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent, Stage>) => {
    const stage = e.target.getStage();

    if (!stage) {
        return;
    }

    const pos = stage.getPointerPosition();

    if (!pos) {
        return;
    }

    // If in pan mode, just return - useDrag will handle it
    if (tool.value === 'pan') {
        return;
    }

    // Set isDrawing to true for both tools
    isDrawing.value = true;

    // Adjust pointer position based on stage scale and position
    const adjustedPos = {
        x: (pos.x - stagePosition.value.x) / stageScale.value,
        y: (pos.y - stagePosition.value.y) / stageScale.value
    };

    // If using eraser, check for line intersections and remove them
    if (tool.value === 'eraser') {
        const intersectedLines = findIntersectedLines(adjustedPos.x, adjustedPos.y, eraserSize.value / stageScale.value);

        // Remove intersected lines (in reverse order to avoid index shifting)
        for (let i = intersectedLines.length - 1; i >= 0; i--) {
            lines.value.splice(intersectedLines[i], 1);
        }

        if (intersectedLines.length > 0) {
            isEdited.value = true;
        }
    } else {
        // If using brush, start a new line
        lines.value.push({ points: [adjustedPos.x, adjustedPos.y], color: selectedColor.value });
        isEdited.value = true;
    }
};

const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent, Stage>) => {
    const stage = e.target.getStage();

    if (!stage) {
        return;
    }

    const point = stage.getPointerPosition();

    if (!point) {
        return;
    }

    // Adjust pointer position based on stage scale and position
    const adjustedPos = {
        x: (point.x - stagePosition.value.x) / stageScale.value,
        y: (point.y - stagePosition.value.y) / stageScale.value
    };

    // Update cursor position for eraser visualization
    cursorPosition.value = { x: adjustedPos.x, y: adjustedPos.y };

    // Exit early if we're not drawing (mouse not pressed)
    if (!isDrawing.value) {
        return;
    }

    // If using eraser and mouse button is pressed, check and remove intersected lines
    if (tool.value === 'eraser') {
        const intersectedLines = findIntersectedLines(adjustedPos.x, adjustedPos.y, eraserSize.value / stageScale.value);

        // Remove intersected lines (in reverse order to avoid index shifting)
        for (let i = intersectedLines.length - 1; i >= 0; i--) {
            lines.value.splice(intersectedLines[i], 1);
        }

        if (intersectedLines.length > 0) {
            isEdited.value = true;
        }

        return;
    }

    // Continue drawing the current line with brush
    const lastLine = lines.value[lines.value.length - 1];
    lastLine.points = lastLine.points.concat([adjustedPos.x, adjustedPos.y]);
    lines.value.splice(lines.value.length - 1, 1, { ...lastLine });
    isEdited.value = true;
};

const handleMouseUp = () => {
    isDrawing.value = false;
    lastCenter.value = undefined;
    lastDist.value = 0;
};

/**
 * Handle touch start event
 */
const handleTouchStart = (e: KonvaEventObject<TouchEvent, Stage>) => {    // Check if it's a multi-touch event (2 or more touches)
    const touches = e.evt.touches;

    if (touches.length >= 2) {
        // It's a pinch/zoom gesture
        isDrawing.value = false;
        return;
    }

    // If in pan mode, just return - useDrag will handle it
    if (tool.value === 'pan') {
        return;
    }

    // Otherwise treat as a regular drawing touch
    handleMouseDown(e);
};

/**
 * Handle touch move event
 */
/**
 * Handle touch move event
 * Note: Pinch gesture is now handled by the usePinch hook
 */
const handleTouchMove = (e: KonvaEventObject<TouchEvent, Stage>) => {
    const touches = e.evt.touches;

    if (touches.length >= 2) {
        // It's a pinch/zoom gesture - now handled by usePinch hook
        // Just prevent default drawing behavior
        isDrawing.value = false;
        return;
    }

    // Single touch - handle as regular drawing
    handleMouseMove(e);
};

/**
 * Toggle between draw mode and pan mode
 * Using useDrag from @vueuse/gesture for drag operations
 */

/**
 * Toggle between draw mode and pan mode
 */
function togglePanMode(): void {
    tool.value = 'pan';
}

/**
 * Selects a color from the color picker
 * @param color The color to select
 */
function selectColor(color: string): void {
    selectedColor.value = color;
}

/**
 * Clear all drawn lines from the canvas
 */
function clearCanvas(): void {
    if (lines.value.length > 0) {
        if (window.confirm('Clear all drawings?')) {
            lines.value = [];
            isEdited.value = true;
        }
    }
}

/**
 * Reset zoom and position to default
 */
function resetView(): void {
    stageScale.value = 1;
    stagePosition.value = { x: 0, y: 0 };
}
</script>

<template>
    <div class="relative">
        <v-stage ref="stageRef" :config="stageConfig" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
            @mouseup="handleMouseUp" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
            @touchend="handleMouseUp">
            <v-layer :config="{
                scaleX: stageScale,
                scaleY: stageScale,
                x: stagePosition.x,
                y: stagePosition.y,
            }">
                <v-image :config="imageConfig">
                </v-image>
                <v-line v-for="(line, i) in lines" :key="i" :config="{
                    points: line.points,
                    stroke: line.color,
                    strokeWidth: 5,
                    tension: 0.5,
                    lineCap: 'round',
                    lineJoin: 'round',
                }" />

                <!-- Visual indicator for eraser -->
                <v-circle v-if="tool === 'eraser'" :config="{
                    x: cursorPosition.x,
                    y: cursorPosition.y,
                    radius: eraserSize,
                    stroke: 'white',
                    shadowColor: 'black',
                    shadowBlur: 2,
                    strokeWidth: 1,
                    shadowOpacity: 1,
                    dash: [5, 5],
                    opacity: 1,
                    listening: false
                }" />
            </v-layer>
        </v-stage>

        <!-- Top action bar with Cancel/Done buttons -->
        <div
            class="fixed top-0 left-0 right-0 pt-safe-top z-10 flex justify-between items-center px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
            <UButton size="sm" color="neutral" variant="ghost" @click="cancelDrawing" icon="i-lucide-x"
                aria-label="Cancel editing">
                Cancel
            </UButton>

            <UButton size="sm" color="primary" @click="saveDrawing" :loading="isSaving" :disabled="isSaving"
                icon="i-lucide-check" aria-label="Save drawing">
                Done
            </UButton>
        </div>

        <div>
            <!-- Zoom controls for mobile -->
            <div
                class="absolute top-28 right-4 flex flex-col gap-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-1">
                <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-zoom-in"
                    @click="stageScale = Math.min(stageScale * 1.2, 4)" aria-label="Zoom in" />
                <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-zoom-out"
                    @click="stageScale = Math.max(stageScale / 1.2, 0.5)" aria-label="Zoom out" />
                <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-maximize" @click="resetView()"
                    aria-label="Reset view" />
                <UButton size="sm" color="error" variant="ghost" icon="i-lucide-circle-slash" @click="clearCanvas()"
                    aria-label="Clear all drawings" />
            </div>
        </div>

        <!-- Mobile-friendly toolbar with safe area support -->
        <div
            class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200 pb-safe-bottom">
            <!-- Tool selection pills -->
            <div class="flex justify-center -mt-5 px-4">
                <UButtonGroup size="xl">
                    <UButton @click="tool = 'brush'" :active="tool === 'brush'" active-color="primary" size="md"
                        icon="i-lucide-brush" color="neutral" variant="solid" aria-label="Select Brush Tool">
                        <span class="ml-1 text-sm hidden sm:inline">Brush</span>
                    </UButton>
                    <UButton @click="tool = 'eraser'" :active="tool === 'eraser'" active-color="primary" size="md"
                        icon="i-lucide-eraser" color="neutral" variant="solid" aria-label="Select Eraser Tool">
                        <span class="ml-1 text-sm hidden sm:inline">Eraser</span>
                    </UButton>

                    <!-- Pan mode button for mobile -->
                    <UButton @click="togglePanMode" :active="tool === 'pan'" active-color="primary" size="md"
                        icon="i-lucide-hand" color="neutral" variant="solid" aria-label="Toggle Pan Mode">
                        <span class="ml-1 text-sm hidden sm:inline">Pan</span>
                    </UButton>
                </UButtonGroup>
            </div>

            <div class="flex items-center justify-between px-4 py-3">
                <!-- Tool-specific controls -->
                <div v-if="tool === 'brush'" class="w-full">
                    <!-- Color picker for brush tool -->
                    <div class="flex-1  hide-scrollbar touch-pan-x pb-1 px-2">
                        <div class="flex gap-3 justify-center min-w-max">
                            <div v-for="color in commonColors" :key="color.value"
                                class="w-10 h-10 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center touch-action-manipulation"
                                :class="selectedColor === color.value ? 'border-primary-500 scale-110 shadow-md' : 'border-transparent'"
                                :style="{ backgroundColor: color.value }" :title="color.label"
                                @click="selectColor(color.value)" :aria-label="`Select ${color.label} color`"
                                role="radio" :aria-checked="selectedColor === color.value">
                                <UIcon v-if="selectedColor === color.value" name="i-lucide-check"
                                    :class="(color.value === '#FFFFFF' || color.value === '#FFFF00') ? 'text-black' : 'text-white'"
                                    size="sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Eraser size slider for eraser tool -->
                <div v-if="tool === 'eraser'" class="w-full flex items-center justify-center gap-3">
                    <UButton size="sm" color="neutral" class="text-gray-600"
                        @click="eraserSize = Math.max(5, eraserSize - 5)" icon="i-lucide-minus-circle" />

                    <div class="flex-1 relative">
                        <input type="range" v-model.number="eraserSize" min="5" max="60" step="1"
                            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <div class="text-xs text-center text-gray-500 mt-1">{{ eraserSize }}px</div>
                    </div>

                    <UButton size="sm" color="neutral" class="text-gray-600"
                        @click="eraserSize = Math.min(60, eraserSize + 5)" icon="i-lucide-plus-circle" />
                </div>

                <!-- Pan mode controls -->
                <div v-if="tool === 'pan'" class="w-full flex items-center justify-center">
                    <div class="text-sm text-center text-gray-700">
                        <UIcon name="i-lucide-info" class="mr-1" size="xs" /> Drag to move the image. Pinch to zoom.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Style the range input slider for better mobile UI */
input[type=range] {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    border-radius: 5px;
    background: #e5e7eb;
    outline: none;
}

input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type=range]::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Hide scrollbar but allow scrolling */
.hide-scrollbar {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari and Opera */
}

/* Touch handling improvements */
.v-stage {
    touch-action: none;
    /* Prevent browser handling of touch events */
}

/* Better touch targets for mobile */
.touch-action-manipulation {
    touch-action: manipulation;
    /* Disable double-tap to zoom */
}

/* Interaction feedback styles */
div[role="radio"] {
    transition: transform 0.15s ease;
}

div[role="radio"]:active {
    transform: scale(0.92);
}

/* Tailwind doesn't have these by default */
.bg-white\/95 {
    background-color: rgba(255, 255, 255, 0.95);
}

.backdrop-blur-sm {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}
</style>