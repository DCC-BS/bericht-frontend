<script lang="ts" setup>
import ComplaintItem from '~/components/complaints/ComplaintItem.vue';
import type { ComplaintItemDto, ComplaintItemType, IComplaintItem } from '~/models/compaint_item';
import type { IComplaint } from '~/models/complaint';


const route = useRoute();
const complaintService = useComplaintService();
const complaintItemService = useComplaintItemService();
const toast = useToast();
const { t } = useI18n();

const reportId = route.params.reportId;
const complaintId = route.params.complaintId;

const currentComplaint = ref<IComplaint>();
const isModalOpen = ref(false);
const itemToAdd = ref<Omit<ComplaintItemDto, "id" | "order">>();

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

function closeModal(): void {
    isModalOpen.value = false;
    itemToAdd.value = undefined;
}

async function onAdd(type: ComplaintItemType): Promise<void> {
    if (!currentComplaint.value) {
        toast.add({
            title: t('complaint.notFound'),
            icon: 'i-heroicons-exclamation-circle',
            color: 'error',
        });
        return;
    }

    itemToAdd.value = {
        type: type,
    };
    isModalOpen.value = true;
}

async function onDelete(item: IComplaintItem): Promise<void> {
    if (!currentComplaint.value) {
        toast.add({
            title: t('complaint.notFound'),
            icon: 'i-heroicons-exclamation-circle',
            color: 'error',
        });
        return;
    }

    currentComplaint.value.removeItem(item.id);
    await complaintItemService.delete(item.id);
    await complaintService.put(currentComplaint.value);
}

async function addItem(): Promise<void> {
    if (!currentComplaint.value || !itemToAdd.value) {
        toast.add({
            title: t('complaint.notFound'),
            icon: 'i-heroicons-exclamation-circle',
            color: 'error',
        });
        return;
    }

    const item = currentComplaint.value.addItem(itemToAdd.value);
    await complaintItemService.put(item);
    await complaintService.put(currentComplaint.value);
    itemToAdd.value = undefined;
    isModalOpen.value = false;
}

async function onPhotoCaptured(photo: Blob) {
    // if item to add is undefied or not of type ComplaintImage (instead of ComplaintItem)
    if (!itemToAdd.value) {
        isModalOpen.value = false;
        return;
    }

    itemToAdd.value.image = {
        image: photo,
        id: generateUUID(),
    }

    await addItem();
}

async function onRecordingComplete(recording: Blob) {
    if (!itemToAdd.value) {
        isModalOpen.value = false;
        return;
    }

    itemToAdd.value.audio = recording;
    // TODO: spech to text
    await addItem();
}

</script>

<template>
    <NavigationMenu :backUrl="`/notes/${reportId}`" :items="[
        {
            icon: 'i-lucide-trash-2',
            onSelect: () => { },
        },
    ]" />

    <div v-if="isModalOpen" class="w-full h-full p-2">
        <CameraCapture v-if="itemToAdd?.type == 'image'" @photo-captured="onPhotoCaptured" />
        <AudioRecorder v-else-if="itemToAdd?.type == 'recording'" @recording-complete="onRecordingComplete" />
        <div v-else-if="itemToAdd?.type == 'text'" class="flex flex-col gap-2">
            <UTextarea v-model="itemToAdd.text" class="w-full mt-2" :rows="3">
            </UTextarea>
            <UButton @click="addItem" class="m-auto" variant="soft" color="neutral" size="lg" icon="i-lucide-plus"
                :label="t('complaintItem.addText')" />
        </div>


        <UButton class="absolute bottom-2 right-2" @click="closeModal" variant="soft" color="neutral" size="lg"
            icon="i-lucide-x" />
    </div>
    <div v-else-if="currentComplaint">
        <ComplaintItem v-for="item in currentComplaint.items" :key="item.id" :item="item" @delete="onDelete(item)">
        </ComplaintItem>
        <div v-if="currentComplaint.items.length === 0" class="text-center py-8">
            <p>{{ t('complaint.noItems') }}</p>
        </div>

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
        ]" />
    </div>
    <div v-else class="flex justify-center items-center h-screen">
        <UIcon name="i-lucide-refresh-cw" class="w-10 h-10 animate-spin text-primary" />
        <p class="ml-4">{{ t('complaint.loading') }}</p>
    </div>
</template>