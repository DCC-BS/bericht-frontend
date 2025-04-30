import type { IReport } from "~/models/report";

export async function sendEmail(to: string, report: IReport) {
    const docx = await createDoxf(report);

    // downloadBlob(docx, `${report.name}.docx`);

    const data = new FormData();
    data.append("file", docx, `${report.name}.docx`);
    data.append("subject", `Report: ${report.name}`);
    data.append("body", `Report: ${report.name}`);
    data.append("to", to);

    $fetch("/api/send", {
        method: "POST",
        body: data
    });
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}