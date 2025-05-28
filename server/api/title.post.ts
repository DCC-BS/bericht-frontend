import type { TitleResponse } from "~/models/title_response";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const body = await readBody(event);
    const text = body.text as string;

    if (!text) {
        throw createError({
            statusCode: 400,
            statusMessage: "Text not provided",
        });
    }

    return await verboseFetch<TitleResponse>(
        `${config.public.apiUrl}/title`,
        event,
        {
            method: "POST",
            body: {
                text: text,
            },
        },
    );
});
