import type { IReport } from "~/models/report";

/**
 * Send email with report attachment
 * @param to - Email recipient
 * @param report - Report to send
 * @param createdAtLabel - Optional label for "Created at" text
 */
export async function sendEmail(
    to: string,
    report: IReport,
    createdAtLabel?: string,
): Promise<void> {
    const docx = await createDoxf(report, createdAtLabel);

    // downloadBlob(docx, `${report.name}.docx`);

    const data = new FormData();
    data.append("file", docx, `${report.name}.docx`);
    data.append("subject", `Report: ${report.name}`);
    data.append("body", `Report: ${report.name}`);
    data.append("to", to);

    $fetch("/api/send", {
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
