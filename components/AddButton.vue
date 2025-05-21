<script lang="ts" setup>

type ButtonProps = {
    icon: string;
    label?: string;
    onClick: () => void;
};

interface InputProps {
    buttons: ButtonProps[];
}

const props = defineProps<InputProps>();

// State for tracking if the menu is open or closed
const isOpen = ref(false);

/**
 * Toggles the open state of the add button menu
 */
function toggleOpen(): void {
    isOpen.value = !isOpen.value;
}

function onButonClick(button: ButtonProps): void {
    button.onClick();
    isOpen.value = false;
}
</script>

<template>
    <div class="z-200 fixed bottom-0 right-0 m-4 flex flex-col-reverse items-end gap-2 justify-end">
        <UButton variant="solid" color="primary" size="xl" icon="i-lucide-plus" class="rounded-full add-button"
            :class="{ 'rotate-in': isOpen, 'rotate-out': !isOpen }" @click="toggleOpen">
        </UButton>
        <TransitionGroup name="menu-animation" tag="div" class="flex flex-col gap-2 justify-end items-end" appear>
            <div v-if="isOpen" class="menu-item-wrapper" v-for="(button, index) in props.buttons" :key="index">
                <UButton :trailing-icon="button.icon" :label="button.label" class="menu-item" variant="soft" size="xl"
                    color="neutral" @click="onButonClick(button)">
                </UButton>
            </div>
        </TransitionGroup>
    </div>
</template>

<style>
/* Rotation animation for the add button */
.add-button {
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    will-change: transform;
}

.rotate-in {
    transform: rotate(135deg);
}

.rotate-out {
    transform: rotate(0deg);
}

/* Menu items spread animation */
.menu-animation-enter-active,
.menu-animation-leave-active {
    transition: all 0.4s ease;
    position: relative;
}

.menu-animation-enter-from,
.menu-animation-leave-to {
    opacity: 0;
    transform: translateY(30px) scale(0.7);
}

/* Each item needs its own transition timing */
.menu-item-wrapper {
    transition-property: all;
    transition-duration: 0.3s;
}

/* Menu item wrapper to ensure proper animation */
.menu-item-wrapper {
    transform-origin: center bottom;
    will-change: transform, opacity;
    margin-bottom: 8px;
}

/* Menu item styling */
.menu-item {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>