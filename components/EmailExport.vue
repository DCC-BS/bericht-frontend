<script lang="ts" setup>
import type { IReport } from '~/models/report';

interface InputProps {
    report: IReport;
}

const props = defineProps<InputProps>();
const toast = useToast();
const { t } = useI18n();

const to = ref<string>('');

/**
 * Sends an email with the report to the specified email address
 */
async function sendMail() {
    if(!to.value) {
        toast.add({
            title: t('email.validEmail'),
            icon: 'i-heroicons-exclamation-circle',
            color: 'error',
        });
        return;
    }

    await sendEmail(to.value, props.report);

    toast.add({
        title: t('email.sent'),
        icon: 'i-heroicons-check-circle',
        color: 'success',
    });
}

</script>

<template>
    <div>
        <UInput v-model="to" type="email" :placeholder="t('email.enterEmail')" class="mb-4" />
        <UButton @click="sendMail" color="primary" class="w-full">
            {{ t('email.send') }}
        </UButton>
    </div>
</template>

<style>

</style>