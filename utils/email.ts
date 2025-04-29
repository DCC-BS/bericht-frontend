import type { IReport } from "~/models/report";

export async function sendEmail(to: string, report: IReport) {
    const docx = await createDoxf(report);

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