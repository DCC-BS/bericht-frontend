<script lang="ts" setup>

function onRecordingComplete(file: Blob) {
}
</script>

<template>

    <AudioRecorder @recording-complete="onRecordingComplete" />

</template>