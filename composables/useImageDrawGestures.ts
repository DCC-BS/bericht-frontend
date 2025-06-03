import { useDrag, usePinch } from "@vueuse/gesture";
import type { Stage } from "konva/lib/Stage";
import { type Ref, ref } from "vue";

/**
 * Composable for handling gesture interactions (pinch zoom and drag pan)
 * in the image drawing component
 */
export function useImageDrawGestures(
    stageScale: Ref<number>,
    stagePosition: Ref<{ x: number; y: number }>,
    tool: Ref<"brush" | "eraser" | "pan">,
    isDrawing: Ref<boolean>,
    stageRef: Ref<{ getStage: () => Stage | null } | undefined>,
) {
    // State for gesture handling
    const lastDist = ref<number>(0);
    const isDragging = ref(false);

    /**
     * Handle pinch gesture for zooming
     * Uses the @vueuse/gesture library for better gesture handling
     */
    usePinch(
        (state) => {
            const {
                da, // [d,a] absolute distance and angle of the two pointers
                origin, // coordinates of the center between the two touch events
                event,
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
                            y: origin[1],
                        };

                        // Calculate the position difference caused by scaling
                        const mousePointTo = {
                            x:
                                (pointerPos.x - stagePosition.value.x) /
                                oldScale,
                            y:
                                (pointerPos.y - stagePosition.value.y) /
                                oldScale,
                        };

                        // Adjust position to keep pinch center stationary
                        stagePosition.value = {
                            x: pointerPos.x - mousePointTo.x * limitedScale,
                            y: pointerPos.y - mousePointTo.y * limitedScale,
                        };
                    }
                }
            }

            // Update last distance value for next frame
            lastDist.value = distance;

            // Reset drawing state during pinch operations
            isDrawing.value = false;
        },
        {
            passive: false,
            domTarget: window,
            eventOptions: { capture: true },
        },
    );

    /**
     * Handle drag gesture for panning the canvas
     * Uses the @vueuse/gesture library for better gesture handling
     */
    useDrag(
        ({ active, first, last, delta: [dx, dy] }) => {
            // Only activate dragging when in pan mode
            if (tool.value !== "pan") return;

            // Update dragging state
            isDragging.value = active;
            const speed = 1; // Speed multiplier for dragging

            if (first) {
                // Start of drag - can perform initialization if needed
            } else if (active) {
                // During drag - update position
                stagePosition.value = {
                    x: stagePosition.value.x + dx * speed,
                    y: stagePosition.value.y + dy * speed,
                };
            }

            if (last) {
                // End of drag
            }
        },
        {
            passive: false,
            domTarget: window,
            eventOptions: { capture: true },
        },
    );

    /**
     * Reset zoom and position to default
     */
    function resetView(): void {
        stageScale.value = 1;
        stagePosition.value = { x: 0, y: 0 };
    }

    /**
     * Programmatically zoom in
     */
    function zoomIn(): void {
        stageScale.value = Math.min(stageScale.value * 1.2, 4);
    }

    /**
     * Programmatically zoom out
     */
    function zoomOut(): void {
        stageScale.value = Math.max(stageScale.value / 1.2, 0.5);
    }

    return {
        isDragging,
        resetView,
        zoomIn,
        zoomOut,
    };
}
