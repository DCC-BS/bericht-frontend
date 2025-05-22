<script lang="ts" setup>
import type { IReport } from "~/models/report";
import type { ReportService } from "~/services/report.service";

interface InputProps {
    report: IReport;
    reportService: ReportService;
}

const props = defineProps<InputProps>();
const toast = useToast();
const { t } = useI18n();
const isOpen = ref(false);

const to = ref<string>("");

/**
 * Sends an email with the report to the specified email address
 */
async function sendMail() {
    if (!to.value) {
        toast.add({
            title: t("email.validEmail"),
            icon: "i-heroicons-exclamation-circle",
            color: "error",
        });
        return;
    }

    try {
        await props.reportService.generateTitles(props.report);
        await sendEmail(to.value, props.report);

        toast.add({
            title: t("email.sent"),
            icon: "i-heroicons-check-circle",
            color: "success",
        });
    } catch (error) {
        if (error instanceof Error) {
            toast.add({
                title: error.message,
                icon: "i-heroicons-exclamation-circle",
                color: "error",
            });
        } else {
            toast.add({
                title: t("email.error"),
                icon: "i-heroicons-exclamation-circle",
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

    <div>
        <UButton @click="isOpen = true" color="primary" class="w-full flex items-center justify-center gap-2"
            icon="i-lucide-send">
            {{ t('email.send') }}
        </UButton>
    </div>
</template>

<style></style>