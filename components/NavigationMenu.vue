<script lang="ts" setup>
import type { NavigationMenuItem } from "#ui/components/NavigationMenu.vue";
import { useOnline } from "@vueuse/core";

interface InputProps {
    backUrl: string;
    items?: NavigationMenuItem[];
}

const props = withDefaults(defineProps<InputProps>(), {
    items: () => [],
});

// Add translation hook
const { t } = useI18n();

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const isOnline = useOnline();

const availableLocales = computed(() => {
    return locales.value.filter((i) => i.code !== locale.value);
});

// Navigation menu items
const items = computed<NavigationMenuItem[][]>(() => [
    [
        {
            label: t("navigation.back"),
            icon: "i-lucide-arrow-left",
            to: props.backUrl,
        },
    ],
    [
        {
            slot: "onlinestatus",
        }
    ],
    [
        ...props.items,
        {
            icon: "i-lucide-languages",
            children: availableLocales.value.map((locale) => ({
                label: locale.name,
                to: switchLocalePath(locale.code),
            })),
        },
    ],
]);
</script>

<template>
    <div class="fixed w-full z-50 bg-white shadow-md">
        <UNavigationMenu content-orientation="vertical" :items="items" class="w-full justify-between z-50">
            <template #onlinestatus-label>
                <UTooltip :text="isOnline ? t('navigation.online') : t('navigation.offline')">
                    <UIcon :name="isOnline ? 'i-lucide-wifi' : 'i-lucide-wifi-off'" class="size-5" :class="{
                        'text-green-500': isOnline,
                        'text-red-500': !isOnline,
                    }" />
                </UTooltip>
            </template>
        </UNavigationMenu>

        <UIcon name="i-lucide-wifi-off" class="hidden"></UIcon>
    </div>
    <div class=" h-[60px]" />
</template>
