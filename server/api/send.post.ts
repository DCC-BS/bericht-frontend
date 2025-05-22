export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const inputFormData = await readFormData(event);
    const fileContent = inputFormData.get("file") as File;
    const subject = inputFormData.get("subject") as string;
    const body = inputFormData.get("body") as string;
    const to = inputFormData.get("to") as string;

    if (!fileContent) {
        throw createError({
            statusCode: 400,
            statusMessage: "File not provided",
        });
    }

    const formData = new FormData();
    formData.append("file", fileContent, "report.docx");
    formData.append("to_email", to);
    formData.append("subject", subject);
    formData.append("email_body", body);

    // Attempt to make the API request
    const response = await verboseFetch(`${config.public.apiUrl}/send`, event, {
        method: "POST",
        body: formData,
    });

    return response;
});
