<script setup lang="ts">
import type { KonvaEventObject } from 'konva/lib/Node';
import { useImage } from 'vue-konva';
import type Konva from 'konva';
import { ref, computed, watch } from 'vue';
import type { Stage } from 'konva/lib/Stage';
import { useImageDrawGestures } from '~/composables/useImageDrawGestures';
import { useImageDrawDimensions } from '~/composables/useImageDrawDimensions';
import { useImageDrawing, COMMON_COLORS } from '~/composables/useImageDrawing';

interface InputProps {
    src: string;
}

const props = defineProps<InputProps>();
const emit = defineEmits(['save', 'cancel']);

// Load image using vue-konva composable
const [image] = useImage(props.src);

// Initialize composables for different concerns
const { stageConfig, imageDimensions, calculateImageDimensions } = useImageDrawDimensions();

// State for zoom and pan functionality
const stageScale = ref(1);
const stagePosition = ref({ x: 0, y: 0 });
const stageRef = ref<{ getStage: () => Stage | null }>();

// Initialize drawing functionality
const {
    tool,
    lines,
    isDrawing,
    selectedColor,
    eraserSize,
    cursorPosition,
    isEdited,
    startDrawing,
    continueDrawing,
    endDrawing,
    selectColor,
    clearCanvas,
    setTool
} = useImageDrawing(stageScale, stagePosition);

// Initialize gesture handling
const { resetView, zoomIn, zoomOut } = useImageDrawGestures(
    stageScale,
    stagePosition,
    tool,
    isDrawing,
    stageRef
);

// State for saving
const isSaving = ref(false);

// Calculate image dimensions when image loads or on resize
watch(image, (newImage) => {
    if (newImage) {
        calculateImageDimensions(newImage);
    }
}, { immediate: true });

// Computed configuration for the image in Konva
const imageConfig = computed<Konva.ImageConfig>(() => ({
    image: image.value ?? new Image(),
    width: imageDimensions.value.width,
    height: imageDimensions.value.height,
    x: imageDimensions.value.x,
    y: imageDimensions.value.y
}));

/**
 * Convert SVG from Konva stage to PNG image
 * @returns Promise that resolves with the data URL of the PNG image
 */
async function exportToPng(): Promise<Blob | undefined> {
    return new Promise((resolve) => {
        if (!stageRef.value) {
            return resolve(undefined);
        }

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
 * Handle mouse/touch down events for drawing
 */
function handleMouseDown(e: KonvaEventObject<MouseEvent | TouchEvent, Stage>): void {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Use the drawing composable's startDrawing method
    startDrawing(pos);
}

/**
 * Handle mouse/touch move events for drawing
 */
function handleMouseMove(e: KonvaEventObject<MouseEvent | TouchEvent, Stage>): void {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Use the drawing composable's continueDrawing method
    continueDrawing(pos);
}

/**
 * Handle mouse/touch up events for drawing
 */
function handleMouseUp(): void {
    endDrawing();
}

/**
 * Handle touch start event - checks for multi-touch gestures
 */
function handleTouchStart(e: KonvaEventObject<TouchEvent, Stage>): void {
    const touches = e.evt.touches;

    if (touches.length >= 2) {
        // It's a pinch/zoom gesture
        isDrawing.value = false;
        return;
    }

    // Single touch - handle as regular drawing
    handleMouseDown(e);
}

/**
 * Handle touch move event - checks for multi-touch gestures
 */
function handleTouchMove(e: KonvaEventObject<TouchEvent, Stage>): void {
    const touches = e.evt.touches;

    if (touches.length >= 2) {
        // It's a pinch/zoom gesture - handled by usePinch hook
        isDrawing.value = false;
        return;
    }

    // Single touch - handle as regular drawing
    handleMouseMove(e);
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
                <!-- Background image -->
                <v-image :config="imageConfig" />

                <!-- Drawn lines -->
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

        <!-- Zoom controls -->
        <div class="absolute top-28 right-4 flex flex-col gap-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-1">
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-zoom-in" @click="zoomIn"
                aria-label="Zoom in" />
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-zoom-out" @click="zoomOut"
                aria-label="Zoom out" />
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-maximize" @click="resetView"
                aria-label="Reset view" />
            <UButton size="sm" color="error" variant="ghost" icon="i-lucide-circle-slash" @click="clearCanvas"
                aria-label="Clear all drawings" />
        </div>

        <!-- Bottom toolbar -->
        <div
            class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200 pb-safe-bottom">
            <!-- Tool selection -->
            <div class="flex justify-center -mt-5 px-4">
                <UButtonGroup size="xl">
                    <UButton @click="setTool('brush')" :active="tool === 'brush'" active-color="primary" size="md"
                        icon="i-lucide-brush" color="neutral" variant="solid" aria-label="Select Brush Tool">
                        <span class="ml-1 text-sm hidden sm:inline">Brush</span>
                    </UButton>
                    <UButton @click="setTool('eraser')" :active="tool === 'eraser'" active-color="primary" size="md"
                        icon="i-lucide-eraser" color="neutral" variant="solid" aria-label="Select Eraser Tool">
                        <span class="ml-1 text-sm hidden sm:inline">Eraser</span>
                    </UButton>
                    <UButton @click="setTool('pan')" :active="tool === 'pan'" active-color="primary" size="md"
                        icon="i-lucide-hand" color="neutral" variant="solid" aria-label="Toggle Pan Mode">
                        <span class="ml-1 text-sm hidden sm:inline">Pan</span>
                    </UButton>
                </UButtonGroup>
            </div>

            <div class="flex items-center justify-between px-4 py-3">
                <!-- Color picker for brush tool -->
                <div v-if="tool === 'brush'" class="w-full">
                    <div class="flex-1 hide-scrollbar touch-pan-x pb-1 px-2">
                        <div class="flex gap-3 justify-center min-w-max">
                            <div v-for="color in COMMON_COLORS" :key="color.value"
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

                <!-- Eraser size slider -->
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

                <!-- Pan mode info -->
                <div v-if="tool === 'pan'" class="w-full flex items-center justify-center">
                    <div class="text-sm text-center text-gray-700">
                        <UIcon name="i-lucide-info" class="mr-1" size="xs" />
                        Drag to move the image. Pinch to zoom.
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
    scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

/* Touch handling improvements */
.v-stage {
    touch-action: none;
}

/* Better touch targets for mobile */
.touch-action-manipulation {
    touch-action: manipulation;
}

/* Interaction feedback styles */
div[role="radio"] {
    transition: transform 0.15s ease;
}

div[role="radio"]:active {
    transform: scale(0.92);
}

/* Custom backdrop styles */
.bg-white\/95 {
    background-color: rgba(255, 255, 255, 0.95);
}

.backdrop-blur-sm {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}
</style>
