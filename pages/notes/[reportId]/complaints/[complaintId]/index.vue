<script lang="ts" setup>
import { type ComplaintItemType } from '~/models/compaint_item';
import { type IComplaint } from '~/models/complaint';

const route = useRoute();
const complaintService = useComplaintService();
const complaintItemService = useComplaintItemService();
const toast = useToast();
const { t } = useI18n();

const reportId = route.params.reportId;
const complaintId = route.params.complaintId;

const currentComplaint = ref<IComplaint>();

if (!reportId || typeof reportId !== 'string') {
    throw new Error('Report ID is required');
}

if (!complaintId || typeof complaintId !== 'string') {
    throw new Error('Complaint ID is required');
}

onMounted(() => {
    complaintService.get(complaintId).then((complaint) => {
        if (!complaint) {
            toast.add({
                title: t('complaint.notFound'),
                icon: 'i-heroicons-exclamation-circle',
                color: 'error',
            });
        }
        currentComplaint.value = complaint;
    });
});

async function onAdd(type: ComplaintItemType): Promise<void> {
    if(!currentComplaint.value) {
        toast.add({
            title: t('complaint.notFound'),
            icon: 'i-heroicons-exclamation-circle',
            color: 'error',
        });
        return;
    }

    const newItem = currentComplaint.value.addItem({type});
    await complaintItemService.put(newItem);
    await complaintService.put(currentComplaint.value);
}

</script>

<template>
    <NavigationMenu
        :backUrl="`/notes/${reportId}`"
        :items="[
            {
                icon: 'i-lucide-trash-2',
                onSelect: () => {},            
            },
        ]"
    />

    <AddButton :buttons="[
    {
        icon: 'i-lucide-mic',
        label: t('complaint.addRecording'),
        onClick: () => onAdd('recording'),
    },
    {
        icon: 'i-lucide-letter-text',
        label: t('complaint.addText'),
        onClick: () => onAdd('text'),
    },
    {
        icon: 'i-lucide-image',
        label: t('complaint.addImage'),
        onClick: () => onAdd('image'),
    },
    ]"/>
</template> 