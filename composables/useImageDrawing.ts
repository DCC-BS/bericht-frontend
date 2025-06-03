import { ref, type Ref } from 'vue';

/**
 * Interface for line drawing data
 */
export interface LineType {
    points: number[];
    color: string;
}

/**
 * Type for available drawing tools
 */
export type ToolType = 'brush' | 'eraser' | 'pan';

/**
 * Array of color objects for the color picker
 * Each color has a value and a label for accessibility
 */
export const COMMON_COLORS = [
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
 * Composable for handling drawing logic in the image drawing component
 */
export function useImageDrawing(
    stageScale: Ref<number>,
    stagePosition: Ref<{ x: number; y: number }>
) {
    // Drawing state
    const tool = ref<ToolType>('brush');
    const lines = ref<LineType[]>([]);
    const isDrawing = ref(false);
    const selectedColor = ref(COMMON_COLORS[0].value);
    const eraserSize = ref(10);
    const cursorPosition = ref({ x: 0, y: 0 });
    const isEdited = ref(false);

    /**
     * Calculate the distance between a point and a line segment
     */
    function distanceToLineSegment(
        px: number, py: number, 
        x1: number, y1: number, 
        x2: number, y2: number
    ): number {
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

    /**
     * Get adjusted pointer position based on stage scale and position
     */
    function getAdjustedPosition(pos: { x: number; y: number }): { x: number; y: number } {
        return {
            x: (pos.x - stagePosition.value.x) / stageScale.value,
            y: (pos.y - stagePosition.value.y) / stageScale.value
        };
    }

    /**
     * Start drawing or erasing operation
     */
    function startDrawing(pos: { x: number; y: number }): void {
        if (tool.value === 'pan') return;

        isDrawing.value = true;
        const adjustedPos = getAdjustedPosition(pos);

        if (tool.value === 'eraser') {
            const intersectedLines = findIntersectedLines(
                adjustedPos.x, 
                adjustedPos.y, 
                eraserSize.value / stageScale.value
            );

            // Remove intersected lines (in reverse order to avoid index shifting)
            for (let i = intersectedLines.length - 1; i >= 0; i--) {
                lines.value.splice(intersectedLines[i], 1);
            }

            if (intersectedLines.length > 0) {
                isEdited.value = true;
            }
        } else {
            // Start a new line for brush tool
            lines.value.push({ 
                points: [adjustedPos.x, adjustedPos.y], 
                color: selectedColor.value 
            });
            isEdited.value = true;
        }
    }

    /**
     * Continue drawing or erasing operation
     */
    function continueDrawing(pos: { x: number; y: number }): void {
        const adjustedPos = getAdjustedPosition(pos);

        // Update cursor position for eraser visualization
        cursorPosition.value = { x: adjustedPos.x, y: adjustedPos.y };

        // Exit early if we're not drawing
        if (!isDrawing.value) return;

        if (tool.value === 'eraser') {
            const intersectedLines = findIntersectedLines(
                adjustedPos.x, 
                adjustedPos.y, 
                eraserSize.value / stageScale.value
            );

            // Remove intersected lines (in reverse order to avoid index shifting)
            for (let i = intersectedLines.length - 1; i >= 0; i--) {
                lines.value.splice(intersectedLines[i], 1);
            }

            if (intersectedLines.length > 0) {
                isEdited.value = true;
            }
        } else {
            // Continue drawing the current line with brush
            const lastLine = lines.value[lines.value.length - 1];
            lastLine.points = lastLine.points.concat([adjustedPos.x, adjustedPos.y]);
            lines.value.splice(lines.value.length - 1, 1, { ...lastLine });
            isEdited.value = true;
        }
    }

    /**
     * End drawing operation
     */
    function endDrawing(): void {
        isDrawing.value = false;
    }

    /**
     * Select a color from the color picker
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
     * Set the current drawing tool
     */
    function setTool(newTool: ToolType): void {
        tool.value = newTool;
    }

    return {
        // State
        tool,
        lines,
        isDrawing,
        selectedColor,
        eraserSize,
        cursorPosition,
        isEdited,
        
        // Methods
        startDrawing,
        continueDrawing,
        endDrawing,
        selectColor,
        clearCanvas,
        setTool
    };
}
