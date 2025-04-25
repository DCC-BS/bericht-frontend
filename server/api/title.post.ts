import type { TitleResponse } from "~/models/title_response";

export default defineEventHandler(async (event) => {
    return {
        title: "Dummy Titel",
    } as TitleResponse;
});
