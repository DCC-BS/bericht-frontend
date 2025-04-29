import { Document, Footer, ImageRun, NumberFormat, Packer, PageNumber, Paragraph, TextRun } from "docx";
import type { IComplaint } from "~/models/complaint";
import type { IReport } from "~/models/report";

export async function createDoxf(report: IReport) {
    console.log(report.complaints.map(c => toRaw(c.toDto())));
    
    const asycComplainParagraphs = report.complaints.map(async (complaint) => {
        return [
            new Paragraph({
                text: complaint.title,
                heading: "Heading1",
                keepLines: true,
                keepNext: true,
            }),
            new Paragraph({
                children: (await getImages(complaint))
            }),
            ...complaint.memos.map((memo) => {
                return new Paragraph({
                    text: memo.text,

                });
            }),
        ];
    });

    const complainParagraphs = (await Promise.all(asycComplainParagraphs)).flat();

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        pageNumbers: {
                            start: 1,
                            formatType: NumberFormat.DECIMAL,
                        }
                    }
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({ children: [
                                new TextRun("Seite "),
                                new TextRun(PageNumber.CURRENT),
                                new TextRun(" von "),
                                new TextRun(PageNumber.TOTAL_PAGES),
                            ]}),
                        ]
                    })
                },
                children: [
                    new Paragraph({
                        text: report.name,
                        heading: "Title",
                    }),
                    new Paragraph({
                        text: `Created at: ${report.createdAt.toLocaleString()}`,
                    }),
                    new Paragraph({
                        text: `Last modified: ${report.lastModified.toLocaleString()}`,
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
