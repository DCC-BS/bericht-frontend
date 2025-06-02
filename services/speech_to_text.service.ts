import type { TranscriptionResponse } from "~/models/transcription_response";

export class SpeechToTextService {
    static $injectKey = "SpeechToTextService";
    static $inject = [];

    public async transcribeAudio(audioBlob: Blob): Promise<string> {
        const formData = new FormData();
        formData.append("file", audioBlob);

        const response = await $fetch<TranscriptionResponse>("/api/stt", {
            body: formData,
            method: "POST",
        });

        return response.text;
    }
}
