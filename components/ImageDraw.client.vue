<script setup lang="ts">
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage } from 'konva/lib/Stage';
import { useImage } from 'vue-konva';
import type Konva from 'konva';
import { ref, computed, watch } from 'vue';
import { UInput, URadioGroup } from '#components';

interface InputProps {
    src: string;
}

const props = defineProps<InputProps>();

type LineType = {
    points: number[];
    color: string;
};
type ToolType = 'brush' | 'eraser';

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
    { value: '#808080', label: 'Gray' },
    { value: '#A52A2A', label: 'Brown' },
    { value: '#00FFFF', label: 'Cyan' },
    { value: '#FF00FF', label: 'Magenta' }
];

// Create reactive stage config
const stageConfig = ref({
    width: window.innerWidth,
    height: window.innerHeight - 25
});

// Add reactive refs for image dimensions
const imageDimensions = ref({
    width: 0,
    height: 0,
    x: 0,
    y: 0
});

// Calculate image dimensions while preserving aspect ratio
watch(image, (newImage) => {
    if (newImage) {
        // Get the natural dimensions of the image
        const naturalWidth = newImage.naturalWidth;
        const naturalHeight = newImage.naturalHeight;

        // Calculate aspect ratio
        const imageRatio = naturalWidth / naturalHeight;
        const containerRatio = window.innerWidth / (window.innerHeight - 25);

        let newWidth = 0;
        let newHeight = 0;

        // Determine dimensions based on aspect ratio comparison
        if (imageRatio > containerRatio) {
            // Image is wider than container (relative to height)
            newWidth = window.innerWidth;
            newHeight = newWidth / imageRatio;
        } else {
            // Image is taller than container (relative to width)
            newHeight = window.innerHeight - 25;
            newWidth = newHeight * imageRatio;
        }

        // Update the stage dimensions to match the calculated image dimensions
        stageConfig.value = {
            width: newWidth,
            height: newHeight
        };

        // Set image dimensions to match stage (no need for x/y positioning)
        imageDimensions.value = {
            width: newWidth,
            height: newHeight,
            x: 0,
            y: 0
        };
    }
}, { immediate: true });

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

const handleMouseDown = (e: KonvaEventObject<MouseEvent, Stage>) => {
    const stage = e.target.getStage();

    if (!stage) {
        return;
    }

    const pos = stage.getPointerPosition();

    if (!pos) {
        return;
    }

    // Set isDrawing to true for both tools
    isDrawing.value = true;

    // If using eraser, check for line intersections and remove them
    if (tool.value === 'eraser') {
        const intersectedLines = findIntersectedLines(pos.x, pos.y, eraserSize.value);

        // Remove intersected lines (in reverse order to avoid index shifting)
        for (let i = intersectedLines.length - 1; i >= 0; i--) {
            lines.value.splice(intersectedLines[i], 1);
        }
    } else {
        // If using brush, start a new line
        lines.value.push({ points: [pos.x, pos.y], color: selectedColor.value });
    }
};

const handleMouseMove = (e: KonvaEventObject<MouseEvent, Stage>) => {
    const stage = e.target.getStage();

    if (!stage) {
        return;
    }

    const point = stage.getPointerPosition();

    if (!point) {
        return;
    }

    // Update cursor position for eraser visualization
    cursorPosition.value = { x: point.x, y: point.y };

    // Exit early if we're not drawing (mouse not pressed)
    if (!isDrawing.value) {
        return;
    }

    // If using eraser and mouse button is pressed, check and remove intersected lines
    if (tool.value === 'eraser') {
        const intersectedLines = findIntersectedLines(point.x, point.y, eraserSize.value);

        // Remove intersected lines (in reverse order to avoid index shifting)
        for (let i = intersectedLines.length - 1; i >= 0; i--) {
            lines.value.splice(intersectedLines[i], 1);
        }
        return;
    }

    // Continue drawing the current line with brush
    const lastLine = lines.value[lines.value.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.value.splice(lines.value.length - 1, 1, { ...lastLine });
};

const handleMouseUp = () => {
    isDrawing.value = false;
};

/**
 * Selects a color from the color picker
 * @param color The color to select
 */
function selectColor(color: string): void {
    selectedColor.value = color;
}
</script>


<template>
    <div>
        <v-stage :config="stageConfig" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
            @mouseup="handleMouseUp" @touchstart="handleMouseDown" @touchmove="handleMouseMove"
            @touchend="handleMouseUp">
            <v-layer>
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
                    strokeWidth: 1,
                    dash: [5, 5],
                    opacity: 1,
                    listening: false
                }" />
            </v-layer>
        </v-stage>

        <div class="controls">
            <UButton @click="tool = 'brush'" :active="tool === 'brush'" size="sm" icon="i-lucide-brush"
                aria-label="Select Brush Tool" active-color="primary" color="neutral">
                Brush
            </UButton>

            <UButton @click="tool = 'eraser'" :active="tool === 'eraser'" size="sm" icon="i-lucide-eraser"
                aria-label="Select Eraser Tool" active-color="primary" color="neutral">
                Eraser
            </UButton>

            <div v-if="tool === 'brush'" class="color-picker-container">
                <div class="color-picker">
                    <div v-for="color in commonColors" :key="color.value" class="color-swatch"
                        :class="{ 'selected': selectedColor === color.value }" :style="{ backgroundColor: color.value }"
                        :title="color.label" @click="selectColor(color.value)"
                        :aria-label="`Select ${color.label} color`" role="radio"
                        :aria-checked="selectedColor === color.value">
                    </div>
                </div>
            </div>

            <div v-if="tool === 'eraser'" class="eraser-size-control">
                <label for="eraserSize">Eraser Size: {{ eraserSize }}</label>
                <input type="range" id="eraserSize" v-model.number="eraserSize" min="5" max="30" step="1" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.controls {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 20px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: fixed;
    bottom: 0px;
    left: 0px;
    right: 0px;
}

.tool-select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: white;
    font-size: 14px;
    cursor: pointer;
}

.color-picker-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.color-swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.color-swatch:hover {
    transform: scale(1.1);
}

.color-swatch.selected {
    border-color: #333;
    box-shadow: 0 0 0 2px white, 0 0 0 4px #333;
}

.color-swatch[style*="background-color: #FFFFFF"] .selection-indicator,
.color-swatch[style*="background-color: #FFFF00"] .selection-indicator {
    text-shadow: 0px 0px 2px #333, 0px 0px 2px #333;
    color: black;
}

.current-color {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 10px;
}

.selected-color-preview {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #ccc;
}

.eraser-size-control {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-left: 10px;
    border-left: 1px solid #ddd;
}
</style>