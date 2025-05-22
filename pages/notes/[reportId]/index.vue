<script lang="ts" setup>
import Draggable from "vuedraggable";
import { createComplaint } from "~/models/complaint";
import type { IReport } from "~/models/report";
import type { EmailExport } from "#components";
import ComplaintView from "../../../components/complaints/ComplaintView.vue";

const route = useRoute();
const toast = useToast();
const reportService = useReportService();
const complaintService = useComplaintService();
const logger = useLogger();
const { t } = useI18n();

const reportId = route.params.reportId;
const currentReport = ref<IReport>();
const emailExport = ref<InstanceType<typeof EmailExport>>();

if (!reportId || typeof reportId !== "string") {
    throw new Error("Report ID is required");
}

onMounted(() => {
    reportService.getReport(reportId).then((report) => {
        if (!report) {
            toast.add({
                title: t("report.notFound"),
                icon: "i-heroicons-exclamation-circle",
                color: "error",
            });
        }

        console.log("Report:", report);

        currentReport.value = report;
    });
});

watch(
    currentReport,
    (newValue) => {
        if (newValue) {
            reportService.updateReport(newValue);
        }
    },
    { deep: true },
);

async function onAdd(type: "finding" | "action"): Promise<void> {
    if (!currentReport.value) {
        logger.error("Report not found");
        return;
    }

    const complaint = createComplaint({ type });
    currentReport.value.addComplaint(complaint);

    await complaintService.put(complaint);
    await reportService.updateReport(currentReport.value);

    navigateTo(`/notes/${currentReport.value.id}/complaints/${complaint.id}`);
}

function onAddClicked(): void {
    if (!currentReport.value) {
        logger.error("Report not found");
        return;
    }

    currentReport.value.addComplaint(createComplaint({}));
}

function saveReport(): void {
    if (!currentReport.value) {
        logger.error("Report not found");
        return;
    }

    reportService.updateReport(currentReport.value);
    toast.add({
        title: t("report.saved"),
        icon: "i-heroicons-check-circle",
        color: "success",
    });
}

async function exportReport() {
    if (!currentReport.value) {
        logger.error("Report not found");
        return;
    }

    await reportService.generateTitles(currentReport.value);

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
        icon: "i-heroicons-check-circle",
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
            onSelect: () => { },
        },
    ]" />

    <div v-if="currentReport" class="text-center p-1">
        <div class="bg-gray-400 p-1">
            <h1 class="text-xl font-bold mb-2">
                <UInput v-model="currentReport.name" class="w-full" @blur="saveReport"></UInput>
            </h1>
            <div class="grid grid-cols-2 gap-1">
                <div class="text-left font-bold">{{ t('report.subtitle1') }}</div>
                <UInput v-model="currentReport.subtitle1" class="w-full" @blur="saveReport"></UInput>

                <div class="text-left font-bold">{{ t('report.subtitle2') }}</div>
                <UInput v-model="currentReport.subtitle2" class="w-full" @blur="saveReport"></UInput>

                <div class="text-left font-bold">{{ t('report.createdAt') }}</div>
                <div class="text-left">{{ currentReport.createdAt.toLocaleDateString('de-CH') }}</div>
                <div class="text-left font-bold">{{ t('report.updateAt') }}</div>
                <div class="text-left">{{ currentReport.lastModified.toLocaleDateString('de-CH') }}</div>
            </div>
        </div>

        <div class="flex flex-col justify-center">
            <div v-if="currentReport.complaints.length === 0" class="text-center py-8">
                <p>{{ t('report.noComplaints') }}</p>
            </div>

            <Draggable v-else :list="currentReport.complaints as unknown[]" handle=".drag-handle" item-key="id">
                <template #item="{ index }">
                    <div class="border-2 border-gray-300 rounded-lg my-2">
                        <div class="flex items-stretch align-imddle justify-stretch self-stretch">
                            <div class="bg-gray-100 drag-handle w-[50px]">
                                <UIcon name="i-heroicons-bars-3" size="26" />
                            </div>
                            <a class="w-full"
                                :href="`/notes/${currentReport.id}/complaints/${currentReport.complaints[index].id}`">
                                <ComplaintView :complaint="currentReport.complaints[index]" />
                            </a>
                        </div>
                    </div>
                </template>
            </Draggable>

            <div class="flex flex-col gap-2">
                <div class="m-auto w-2/3">
                    <EmailExport :report="currentReport" :reportService="reportService" ref="emailExport" />
                </div>

                <div class="m-auto mb-5 w-2/3">
                    <UButton @click="exportReport" class="w-full flex items-center justify-center gap-2"
                        icon="i-heroicons-document-text">
                        {{ t('report.export') }}
                    </UButton>
                </div>
            </div>
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