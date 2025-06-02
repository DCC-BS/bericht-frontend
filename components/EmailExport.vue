<script lang="ts" setup>
import { useLocalStorage } from "@vueuse/core";
import { Progress } from "~/models/progress";
import type { IReport } from "~/models/report";
import { ReportService } from "~/services/report.service";

interface InputProps {
    report: IReport;
}

const props = defineProps<InputProps>();
const toast = useToast();
const { t } = useI18n();
const isOpen = ref(false);
const reportService = useService(ReportService);
const isExporting = ref(false);

const exportProgress = ref(0);
const progressMessage = ref("");

const to = useLocalStorage("to-email", "");

/**
 * Sends an email with the report to the specified email address
 */
async function sendMail() {
    isExporting.value = true;

    if (!to.value) {
        toast.add({
            title: t("email.validEmail"),
            icon: "i-lucide-circle-alert",
            color: "error",
        });
        return;
    }

    try {
        let isTranscribing = true;
        const progress = new Progress((p: Progress) => {
            progressMessage.value = p.message;

            if (isTranscribing) {
                exportProgress.value = p.t / 2;
            } else {
                exportProgress.value = 0.5 + p.t / 2;
            }
        });

        await reportService.trasncribeMissingRecordings(props.report, progress);
        isTranscribing = false;
        await reportService.generateTitles(props.report, progress);
        await sendEmail(to.value, props.report);

        toast.add({
            title: t("email.sent"),
            icon: "i-lucide-circle-check",
            color: "success",
        });

        isOpen.value = false;
    } catch (error) {
        if (error instanceof Error) {
            toast.add({
                title: error.message,
                icon: "i-lucide-circle-alert",
                color: "error",
            });
        } else {
            toast.add({
                title: t("email.error"),
                icon: "i-lucide-circle-alert",
                color: "error",
            });
        }
    } finally {
        isExporting.value = false;
    }
}



function openModal() {
    isOpen.value = true;
}

defineExpose({
    openModal,
});
</script>

<template>
    <UModal v-model:open="isOpen" class="p-2">
        <template #content>
            <UInput v-model="to" type="email" :placeholder="t('email.enterEmail')" class="mb-2 mt-4 w-full" />
            <UButton @click="sendMail" :disabled="isExporting" color="primary"
                class="w-full flex items-center justify-center gap-2" icon="i-lucide-send">
                {{ t('email.send') }}
            </UButton>
            <div v-if="isExporting" class="mt-4">
                <p class="text-sm text-gray-500 mt-2">{{ progressMessage }}</p>
                <UProgress v-model="exportProgress" :max="1" class="mt-2" color="primary" />
            </div>
        </template>
    </UModal>
</template>

<style></style>