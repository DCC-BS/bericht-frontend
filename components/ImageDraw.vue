<script setup lang="ts">
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Stage } from 'konva/lib/Stage';
import { ref } from 'vue';

type LineType = {
    tool: 'brush' | 'eraser';
    points: number[];
};
type ToolType = 'brush' | 'eraser';

const tool = ref<ToolType>('brush');
const lines = ref<LineType[]>([]);
const isDrawing = ref(false);

const stageConfig = {
    width: window.innerWidth,
    height: window.innerHeight - 25
};

const handleMouseDown = (e: KonvaEventObject<MouseEvent, Stage>) => {
    isDrawing.value = true;
    const stage = e.target.getStage();

    if (!stage) {
        return;
    }

    const pos = stage.getPointerPosition();

    if (!pos) {
        return;
    }

    lines.value.push({ tool: tool.value, points: [pos.x, pos.y] });
};

const handleMouseMove = (e) => {
    if (!isDrawing.value) {
        return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const lastLine = lines.value[lines.value.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.value.splice(lines.value.length - 1, 1, { ...lastLine });
};

const handleMouseUp = () => {
    isDrawing.value = false;
};
</script>


<template>
    <div>
        <select v-model="tool">
            <option value="brush">Brush</option>
            <option value="eraser">Eraser</option>
        </select>
        <v-stage :config="stageConfig" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
            @mouseup="handleMouseUp" @touchstart="handleMouseDown" @touchmove="handleMouseMove"
            @touchend="handleMouseUp">
            <v-layer>
                <v-line v-for="(line, i) in lines" :key="i" :config="{
                    points: line.points,
                    stroke: '#df4b26',
                    strokeWidth: 5,
                    tension: 0.5,
                    lineCap: 'round',
                    lineJoin: 'round',
                    globalCompositeOperation:
                        line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }" />
            </v-layer>
        </v-stage>
    </div>
</template>
