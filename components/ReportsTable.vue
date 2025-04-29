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

/**
 * Format date to a readable string
 */
function formatDate(date: Date | unknown): string {
  return new Date(date as Date).toLocaleString('de-ch', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/*
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

function deleteSelected() {
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
        'aria-label': 'Select all reports'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': `Select reports ${row.getValue('name')}`
      })
  },
  {
    accessorKey: 'name',
    header: 'Report Name',
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, getStringValue(row.getValue('name')));
    }
  },
  {
    accessorKey: 'lastModified',
    header: 'Last Modified',
    cell: ({ row }) => {
      return formatDate(row.getValue('lastModified'));
    }
  },
  {
    id: 'complaints',
    header: 'Complaints',
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
          ariaLabel: 'View report'
        }),
        h(ConfirmButton, {
          onConfirm: () => emit('delete-report', row.original.id),
          class: 'flex items-center',
          ariaLabel: 'Delete report'
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
      <h2 class="text-xl font-semibold">Reports</h2>

      <div v-if="Object.values(rowSelection).length > 0" class="flex items-center gap-2">
        <ConfirmButton
          @confirm="deleteSelected"
          class="flex items-center"
          aria-label="Delete selected reports"
          >
            <UButton
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            size="sm"
            >
            Delete Selected
            </UButton>
        </ConfirmButton>

      </div>
    </div>

    <div class="w-full">
      <UTable ref="table" v-model:row-selection="rowSelection" :data="props.reports" :columns="columns"
        :sort="{ column: 'lastModified', direction: 'desc' }" />

      <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
        {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} report(s) selected.
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