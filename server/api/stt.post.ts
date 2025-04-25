import type { TranscriptionResponse } from "~/models/transcription_response";
import { verboseFetch } from "../utils/verboseFetch";

export default defineEventHandler(async (event) => {
    // Building inspection memos in German
    const debugTexts = [
        "Geländer im 1. OG ist nicht richtig befestigt",
        "Feuerlöscher im Erdgeschoss fehlt",
        "Wasserschaden an der Decke im Raum 302",
        "Notausgangsbeleuchtung im Keller defekt",
        "Risse in der Fassade an der Nordseite",
        "Elektrische Installation im Serverraum nicht vorschriftsmäßig",
        "Stolpergefahr durch losen Teppich im Flur 2. OG",
    ];

    // Select random inspection memo
    const randomIndex = Math.floor(Math.random() * debugTexts.length);
    const selectedText = debugTexts[randomIndex];

    return {
        text: selectedText,
    } as TranscriptionResponse;

    const config = useRuntimeConfig();

    const inputFormData = await readFormData(event);
    const fileContent = inputFormData.get("file") as File;

    if (!fileContent) {
        throw createError({
            statusCode: 400,
            statusMessage: "File not provided",
        });
    }

    const formData = new FormData();
    formData.append("audio_file", fileContent, fileContent.name);

    // Attempt to make the API request
    const response = await verboseFetch<TranscriptionResponse>(
        `${config.public.apiUrl}/stt`,
        event,
        {
            method: "POST",
            body: formData,
        },
    );

    return response;
});
