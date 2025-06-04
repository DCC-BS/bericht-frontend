import type { IReport } from "~/models/report";

/**
 * Sanitizes a filename by removing or replacing invalid characters
 * @param filename - The original filename to sanitize
 * @returns A sanitized filename safe for file systems
 */
export function sanitizeFilename(filename: string): string {
    // Remove or replace invalid characters for file systems
    // Invalid characters: < > : " | ? * \ / and control characters
    return (
        filename
            .replace(/[<>:"|?*\\/]/g, "") // Remove completely invalid characters
            .replace(/[\p{C}]/gu, "") // Remove control characters using Unicode property
            .replace(/^\.+/g, "") // Remove leading dots
            .replace(/\.+$/g, "") // Remove trailing dots
            .replace(/\s+/g, " ") // Replace multiple spaces with single space
            .trim() || // Remove leading/trailing whitespace
        "untitled"
    ); // Fallback if string becomes empty
}

export async function sendEmail(to: string, report: IReport): Promise<void> {
    const docx = await createDoxf(report);

    // Sanitize the report name for safe filename usage
    const sanitizedName = sanitizeFilename(report.name);

    // downloadBlob(docx, `${sanitizedName}.docx`);

    const data = new FormData();
    data.append("file", docx, `${sanitizedName}.docx`);
    data.append("subject", `Report: ${report.name}`); // Keep original name in subject
    data.append("body", `Report: ${report.name}`); // Keep original name in body
    data.append("to", to);
    data.append("file_name", `${sanitizedName}.docx`);

    await $fetch("/api/send", {
        method: "POST",
        body: data,
    });
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
