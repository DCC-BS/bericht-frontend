<script lang="ts" setup>
import { useLocalStorage } from "@vueuse/core";
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

const to = useLocalStorage("to-email", "");

/**
 * Sends an email with the report to the specified email address
 */
async function sendMail() {
    if (!to.value) {
        toast.add({
            title: t("email.validEmail"),
            icon: "i-lucide-circle-alert",
            color: "error",
        });
        return;
    }

    try {
        await reportService.generateTitles(props.report);
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
            <UButton @click="sendMail" color="primary" class="w-full flex items-center justify-center gap-2"
                icon="i-lucide-send">
                {{ t('email.send') }}
            </UButton>
        </template>
    </UModal>
</template>

<style></style>