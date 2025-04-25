import { Document, ImageRun, Packer, Paragraph, TextRun } from "docx";
import type { ComplaintDto, IComplaint } from "~/models/complaint";
import type { IReport } from "~/models/report";

export async function createDoxf(report: IReport) {
    console.log(report.complaints.map(c => toRaw(c.toDto())));
    
    const asycComplainParagraphs = report.complaints.map(async (complaint) => {
        return [
            new Paragraph({
                children: [
                    new TextRun({
                        text: complaint.title,
                        bold: true,
                    }),
                ],
            }),
            new Paragraph({
                children: (await getImages(complaint))
            }),
            ...complaint.memos.map((memo) => {
                return new Paragraph({
                    children: [
                        new TextRun({
                            text: memo.text,
                        }),
                    ],
                });
            }),
        ];
    });

    const complainParagraphs = (await Promise.all(asycComplainParagraphs)).flat();

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: report.name,
                                bold: true,
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Created at: ${report.createdAt.toLocaleString()}`,
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Last modified: ${report.lastModified.toLocaleString()}`,
                            }),
                        ],
                    }),
                    ...complainParagraphs,
                ],
            },
        ],
    });

    return await Packer.toBlob(doc);
}

async function getImages(complaint: IComplaint) {
    return Promise.all(
        complaint.images.map(async (image) => {
            return new ImageRun({
                type: "png",
                data: await image.image.arrayBuffer(),
                transformation: {
                    width: 600,
                    height: 400,
                },
            });
        }),
    );
}
