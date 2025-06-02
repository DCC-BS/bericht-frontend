<script lang="ts" setup>
import ImageDraw from '~/components/ImageDraw.client.vue';
import { ComplaintImage } from '~/models/compaint_item';
import { NotificationService } from '~/services/notification.service';

const route = useRoute();

const reportId = route.params.reportId as string;
const complaintId = route.params.complaintId as string;
const complaintItemId = route.params.itemId as string;

const { currentComplaint, updateComplaintItem } = useComplaintItemService(complaintId);
const imgComplaintItem = ref<ComplaintImage>();
const imgUrl = ref<string>();
const { t } = useI18n();
const notify = useService(NotificationService);

watch(currentComplaint, () => {
	if (!currentComplaint.value) {
		return;
	}

	console.log('Current complaint:', currentComplaint.value, complaintItemId);

	const item = currentComplaint.value.items.find(item => item.id === complaintItemId);

	console.log('Found item:', item);

	if (item instanceof ComplaintImage) {
		imgComplaintItem.value = item;
		imgUrl.value = URL.createObjectURL(item.image.image);
	} else {
		notify.notify({
			title: t('draw.error'),
			icon: 'i-lucide-x',
		});
		navigateBack();
	}
}, { immediate: true });

function onSave(image: File): void {
	if (!imgComplaintItem.value) return;

	imgComplaintItem.value.image.image = image;
	updateComplaintItem(imgComplaintItem.value).then(() => {
		notify.notify({
			title: t('draw.saved'),
			icon: 'i-lucide-check',
		});
		navigateBack();
	});
}

function onCancel(): void {
	navigateBack();
}

function navigateBack(): void {
	navigateTo(`/notes/${reportId}/complaints/${complaintId}`);
}
</script>

<template>
	<div v-if="imgComplaintItem && imgUrl">
		<ClientOnly>
			<ImageDraw :src="imgUrl" @save="onSave" @cancel="onCancel" />
		</ClientOnly>
	</div>
	<div v-else class="flex justify-center items-center h-screen">
		<UIcon name="i-lucide-refresh-cw" class="w-10 h-10 animate-spin text-primary" />
		<p class="ml-4">{{ t('draw.loading') }}</p>
	</div>
</template>