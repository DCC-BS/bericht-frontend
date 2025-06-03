<script lang="ts" setup>
import { useMagicKeys } from "@vueuse/core";
import Draggable from "vuedraggable";
import { createComplaint } from "~/models/complaint";
import type { DeleteModalProps } from "~/models/delte_modal_props";
import { Progress } from "~/models/progress";
import { ReportService } from "~/services/report.service";
import type { EmailExport } from "#components";
import ComplaintView from "../../../components/complaints/ComplaintView.vue";

const route = useRoute();
const toast = useToast();
const logger = useLogger();
const { t } = useI18n();

const { ctrl, e } = useMagicKeys();

const reportId = route.params.reportId;
const emailExport = ref<InstanceType<typeof EmailExport>>();

if (!reportId || typeof reportId !== "string") {
    throw new Error("Report ID is required");
}

const { currentReport, addComplaint } = useComplaintService(reportId);
const { updateReport, removeReport } = useReportService();
const reportService = useService(ReportService);

const deleteModalProps = reactive({
    isOpen: false,
    message: t("report.delete"),
    onSubmit: () => {
        removeReport(reportId).then(() => {
            navigateTo("/");
        });
    },
    onCancel: () => {
        deleteModalProps.isOpen = false;
    },
} as DeleteModalProps);

watch(
    currentReport,
    (newValue) => {
        if (newValue) {
            updateReport(newValue);
        }
    },
    { deep: true },
);

watch([ctrl, e], ([ctrl, e]) => {
    if (ctrl && e) {
        exportReport();
    }
});

async function onAdd(type: "finding" | "action"): Promise<void> {
    if (!currentReport.value) {
        logger.error("Report not found");
        return;
    }

    const complaint = createComplaint({ type });
    await addComplaint(complaint);
    navigateTo(`/notes/${currentReport.value.id}/complaints/${complaint.id}`);
}

function saveReport(): void {
    if (!currentReport.value) {
        logger.error("Report not found");
        return;
    }

    updateReport(currentReport.value);
}

async function exportReport() {
    if (!currentReport.value) {
        logger.error("Report not found");
        return;
    }

    await reportService.generateTitles(currentReport.value, new Progress());

    const report = toRaw(currentReport.value);
    const blob = await createDoxf(report);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentReport.value?.name}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.add({
        title: t("report.exported"),
        icon: "i-lucide-circle-check",
        color: "success",
    });
}
</script>

<template>
    <NavigationMenu backUrl="/" :items="[
        {
            icon: 'i-lucide-send',
            onSelect: () => { emailExport?.openModal() },
        },
        {
            icon: 'i-lucide-trash-2',
            onSelect: () => { deleteModalProps.isOpen = true },
        },
    ]" />

    <DeleteModal :options="deleteModalProps" />
    <EmailExport v-if="currentReport" ref="emailExport" :report="currentReport" />

    <div v-if="currentReport" class="text-center p-1">
        <div class="p-1">
            <h1 class="text-xl font-bold mb-2">
                <UInput v-model="currentReport.name" class="w-full" @blur="saveReport"></UInput>
            </h1>

            <UInput v-model="currentReport.subtitle1" class="w-full pb-1" @blur="saveReport" />
            <UInput v-model="currentReport.subtitle2" class="w-full pb-1" @blur="saveReport" />
        </div>

        <div class="flex flex-col justify-center">
            <div v-if="currentReport.complaints.length === 0" class="text-center py-8">
                <p>{{ t('report.noComplaints') }}</p>
            </div>

            <Draggable v-else :list="currentReport.complaints as unknown[]" handle=".drag-handle" item-key="id">
                <template #item="{ index }">
                    <div class="border-2 border-gray-300 rounded-lg my-2">
                        <div class="flex items-stretch align-middle justify-stretch self-stretch">
                            <div class="bg-gray-100 drag-handle w-[50px] pt-2">
                                <UIcon name="i-lucide-menu" size="26" />
                            </div>
                            <div class="w-full">
                                <ComplaintView :report-id="reportId" :complaint="currentReport.complaints[index]" />
                            </div>
                        </div>
                    </div>
                </template>
            </Draggable>
        </div>
        <AddButton :buttons="[
            {
                icon: 'i-lucide-gavel',
                label: t('complaint.action'),
                onClick: () => onAdd('action'),
            },
            {
                icon: 'i-lucide-package-search',
                label: t('complaint.finding'),
                onClick: () => onAdd('finding'),
            }
        ]" />
    </div>
    <div v-else class="flex justify-center items-center h-screen">
        <UIcon name="i-lucide-refresh-cw" class="w-10 h-10 animate-spin text-primary" />
        <p class="ml-4">{{ t('report.loading') }}</p>
    </div>
</template>