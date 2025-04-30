<script lang="ts" setup>
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import type { IReport } from '~/models/report';
import ConfirmButton from '~/components/ConfirmButton.vue';

// Component resolution for UTable elements
const UCheckbox = resolveComponent('UCheckbox');
const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

interface InputProps {
  reports: IReport[];
}

const props = defineProps<InputProps>();

// Define emit events for CRUD operations
const emit = defineEmits<{
  'view-report': [id: string];
  'delete-report': [id: string];
}>();

// Table reference for selection tracking
const table = useTemplateRef('table');
const rowSelection = ref<Record<string, boolean>>({});

// Get i18n composable for translations
const { t } = useI18n();

/**
 * Format date to a readable string
 */
function formatDate(date: Date | unknown): string {
  return new Date(date as Date).toLocaleString('de-ch', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour12: false
  });
}

/**
 * Count complaints in a report
 */
function getComplaintCount(report: IReport): number {
  return report.complaints.length;
}

/**
 * Safely get string value from row
 */
function getStringValue(value: unknown): string {
  return String(value);
}

/**
 * Delete selected reports
 */
function deleteSelected(): void {
    const rowIdx = Object.keys(rowSelection.value);

    for(const idx of rowIdx) {
        const report = props.reports[Number(idx)];
        emit('delete-report', report.id);
    }
}

/**
 * Define table columns with their formatting and behavior
 */
const columns: TableColumn<IReport>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': t('reportsTable.title')
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': `${t('reportsTable.title')} ${row.getValue('name')}`
      })
  },
  {
    accessorKey: 'name',
    header: t('reportsTable.reportName'),
    cell: ({ row }) => {
      /**
       * Get report name and create a component with truncation and tooltip
       */
      const name = getStringValue(row.getValue('name'));
      
      // Create a container div with truncation styles
      return h('div', { 
        class: 'max-w-[100px] truncate'
      }, [
        // Wrap text in UTooltip component
        h(resolveComponent('UTooltip'), {
          text: name,
          popper: { placement: 'top' }
        }, () => [
          // The actual text that will be truncated
          h('span', { class: 'cursor-help' }, name)
        ])
      ]);
    }
  },
  {
    accessorKey: 'lastModified',
    header: t('reportsTable.lastModified'),
    cell: ({ row }) => {
      return formatDate(row.getValue('lastModified'));
    }
  },
  {
    id: 'complaints',
    header: t('reportsTable.complaints'),
    cell: ({ row }) => {
      const count = getComplaintCount(row.original);
      return h(UBadge, {
        class: 'capitalize',
        variant: 'subtle',
        color: count > 0 ? 'info' : 'neutral'
      }, () => count.toString());
    }
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      // Create action buttons for each row
      return h('div', { class: 'flex items-center space-x-2' }, [
        h(UButton, {
          color: 'primary',
          variant: 'ghost',
          icon: 'i-heroicons-eye',
          size: 'sm',
          onClick: () => emit('view-report', row.original.id),
          ariaLabel: t('reportsTable.view')
        }),
        h(ConfirmButton, {
          onConfirm: () => emit('delete-report', row.original.id),
          class: 'flex items-center',
          ariaLabel: t('reportsTable.delete')
        }, () => [
          h(UButton, {
            color: 'error',
            variant: 'ghost',
            icon: 'i-heroicons-trash',
            size: 'sm'
          })
        ]),
      ]);
    }
  }
];
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">{{ $t('reportsTable.title') }}</h2>

      <div v-if="Object.values(rowSelection).length > 0" class="flex items-center gap-2">
        <ConfirmButton
          @confirm="deleteSelected"
          class="flex items-center"
          :aria-label="$t('reportsTable.deleteSelected')"
          >
            <UButton
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            size="sm"
            >
            {{ $t('reportsTable.deleteSelected') }}
            </UButton>
        </ConfirmButton>

      </div>
    </div>

    <div class="w-full">
      <UTable ref="table" v-model:row-selection="rowSelection" :data="props.reports" :columns="columns"
        :sort="{ column: 'lastModified', direction: 'desc' }" />

      <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
        {{ $t('reportsTable.reportsSelected', 
          [table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0,
           table?.tableApi?.getFilteredRowModel().rows.length || 0]) }}
      </div>
    </div>
  </div>
</template>

<style>
.u-table th {
  font-weight: 600;
  text-transform: capitalize;
}

.u-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>