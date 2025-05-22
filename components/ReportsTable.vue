<script lang="ts" setup>
import ConfirmButton from "~/components/ConfirmButton.vue";
import type { IReport } from "~/models/report";

interface InputProps {
    reports: IReport[];
}

const props = defineProps<InputProps>();

// Define emit events for CRUD operations
const emit = defineEmits<{
    "view-report": [id: string];
    "delete-report": [id: string];
}>();

// Selection tracking
const selectedReports = ref<Record<string, boolean>>({});

// Get i18n composable for translations
const { t } = useI18n();

// Computed property for sorted reports
const sortedReports = computed(() => {
    return [...props.reports].sort(
        (a, b) =>
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime(),
    );
});

// Computed property for selected reports count
const selectedCount = computed(
    () => Object.values(selectedReports.value).filter(Boolean).length,
);

// Computed property for all reports being selected
const allSelected = computed(() => {
    return (
        props.reports.length > 0 && selectedCount.value === props.reports.length
    );
});

/**
 * Toggle selection of all reports
 */
function toggleSelectAll(): void {
    if (allSelected.value) {
        selectedReports.value = {};
    } else {
        selectedReports.value = props.reports.reduce(
            (acc, report, index) => {
                acc[index] = true;
                return acc;
            },
            {} as Record<string, boolean>,
        );
    }
}

/**
 * Format date to a readable string
 */
function formatDate(date: Date | unknown): string {
    return new Date(date as Date).toLocaleString("de-ch", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour12: false,
    });
}

/**
 * Count complaints in a report
 */
function getComplaintCount(report: IReport): number {
    return report.complaints.length;
}

/**
 * Delete selected reports
 */
function deleteSelected(): void {
    const rowIdx = Object.keys(selectedReports.value);

    for (const idx of rowIdx) {
        const report = props.reports[Number(idx)];
        emit("delete-report", report.id);
    }

    // Clear selections after delete
    selectedReports.value = {};
}
</script>

<template>
    <div class="flex flex-col gap-4 w-full">
        <!-- Header with title and delete selected button -->
        <div class="flex justify-between items-center flex-wrap gap-2">
            <h2 class="text-xl font-semibold">{{ $t('reportsTable.title') }}</h2>

            <div class="flex items-center gap-2 flex-wrap">
                <!-- Select all checkbox -->
                <UCheckbox :model-value="allSelected ? true : selectedCount > 0 ? 'indeterminate' : false"
                    @update:model-value="toggleSelectAll" :aria-label="$t('reportsTable.selectAll')" />

                <!-- Delete selected button -->
                <ConfirmButton v-if="selectedCount > 0" @confirm="deleteSelected" class="flex items-center"
                    :aria-label="$t('reportsTable.deleteSelected')">
                    <UButton color="error" variant="ghost" icon="i-heroicons-trash" size="sm">
                        {{ $t('reportsTable.deleteSelected') }}
                    </UButton>
                </ConfirmButton>
            </div>
        </div>

        <!-- Mobile-friendly card view -->
        <div class="w-full space-y-3">
            <div v-if="sortedReports.length === 0" class="p-4 text-center text-muted">
                {{ $t('reportsTable.noReports') }}
            </div>

            <div v-for="(report, index) in sortedReports" :key="report.id"
                class="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div class="flex flex-col gap-3">
                    <!-- Card header with name and selection -->
                    <div class="flex justify-between items-center">
                        <h3 class="font-medium text-lg truncate max-w-[70%] cursor-help">{{ report.name }}</h3>

                        <UCheckbox v-model="selectedReports[index]"
                            :aria-label="`${$t('reportsTable.selectReport')} ${report.name}`" />
                    </div>

                    <!-- Date and complaints count -->
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-1 text-sm text-gray-600">
                            <UIcon name="i-lucide-calendar-days" class="h-4 w-4"></UIcon>
                            <span>{{ formatDate(report.lastModified) }}</span>
                        </div>

                        <div class="flex items-center">
                            <UBadge class="capitalize" variant="subtle" color="info">
                                {{ $t('reportsTable.complaints') }}: {{ getComplaintCount(report) }}
                            </UBadge>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex items-center justify-end space-x-2 pt-1">
                        <UButton color="primary" variant="ghost" icon="i-heroicons-eye" size="md"
                            @click="emit('view-report', report.id)" :aria-label="$t('reportsTable.view')" />

                        <ConfirmButton @confirm="emit('delete-report', report.id)" class="flex items-center"
                            :aria-label="$t('reportsTable.delete')">
                            <UButton color="error" variant="ghost" icon="i-heroicons-trash" size="md" />
                        </ConfirmButton>
                    </div>
                </div>
            </div>

            <!-- Summary footer -->
            <div v-if="props.reports.length > 0" class="px-4 py-3.5 border-t border-accented text-sm text-muted">
                {{ $t('reportsTable.reportsSelected', [selectedCount, props.reports.length]) }}
            </div>
        </div>
    </div>
</template>

<style>
/* Add responsive styles */
@media (min-width: 768px) {
    .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }
}
</style>