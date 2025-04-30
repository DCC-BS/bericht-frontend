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
            ...(await getImages(complaint)),
            // new Paragraph({
            //     children: 
            // }),
            ...complaint.memos.map((memo) => {
                return new Paragraph({
                    text: memo.text,
                    spacing: { after: 6 * 20 },
                });
            }),
        ];
    });

    const complainParagraphs = (await Promise.all(asycComplainParagraphs)).flat();

    const doc = new Document({
        sections: [
            {
                // properties: {
                //     page: {
                //         pageNumbers: {
                //             start: 1,
                //             formatType: NumberFormat.DECIMAL,
                //         }
                //     }
                // },
                // footers: {
                //     default: new Footer({
                //         children: [
                //             new Paragraph({
                //                 children: [
                //                     new TextRun({
                //                         children: [
                //                             "Seite ",
                //                             PageNumber.CURRENT,
                //                             " von ",
                //                             PageNumber.TOTAL_PAGES,
                //                         ]
                //                     }),
                //                 ],
                //             }),
                //         ]
                //     })
                // },
                children: [
                    new Paragraph({
                        text: report.name,
                        heading: "Title",
                    }),
                    new Paragraph({
                        text: `Erstellt am: ${report.createdAt.toLocaleString()}`,
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
            return new Paragraph({
                children: [
                    new ImageRun({
                        type: "png",
                        data: await image.image.arrayBuffer(),
                        transformation: {
                            width: 600,
                            height: 400,
                        },
                    }),
                ],
                alignment: "center",
                spacing: { after: 12 * 20 }
            });
        }),
    );
}
