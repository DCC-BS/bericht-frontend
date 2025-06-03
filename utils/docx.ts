import {
    AlignmentType,
    Document,
    Footer,
    ImageRun,
    NumberFormat,
    Packer,
    PageNumber,
    Paragraph,
    TextRun,
} from "docx";
import { render } from "vue";
import type {
    ComplaintImage,
    ComplaintRecording,
    ComplaintText,
    IComplaintItem,
} from "~/models/compaint_item";
import type { IComplaint } from "~/models/complaint";
import type { IReport } from "~/models/report";

/**
 * Calculates the dimensions of an image from a Blob
 * @param imageBlob - The image as a Blob object
 * @returns Promise with the width and height of the image
 */
async function calculateImageSize(
    imageBlob: Blob,
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        // Create an object URL from the blob
        const objectUrl = URL.createObjectURL(imageBlob);

        // Create an image element to load the blob
        const img = new Image();

        // Set up event handlers
        img.onload = (): void => {
            // Get dimensions
            const dimensions = {
                width: img.width,
                height: img.height,
            };

            // Clean up the object URL
            URL.revokeObjectURL(objectUrl);

            // Return the dimensions
            resolve(dimensions);
        };

        img.onerror = (): void => {
            // Clean up and reject if there's an error
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image"));
        };

        // Set the source to start loading
        img.src = objectUrl;
    });
}

/**
 * Calculates either width or height based on the other dimension while maintaining aspect ratio
 * @param originalWidth - The original width of the image
 * @param originalHeight - The original height of the image
 * @param targetWidth - Optional target width to calculate height
 * @param targetHeight - Optional target height to calculate width
 * @returns Object containing the calculated dimensions
 */
function calculateDimensionWithAspectRatio(
    originalWidth: number,
    originalHeight: number,
    targetWidth?: number,
    targetHeight?: number,
): { width: number; height: number } {
    // Calculate the aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    // Initialize result object
    let result = {
        width: originalWidth,
        height: originalHeight,
    };

    // If target width is provided, calculate the height
    if (targetWidth !== undefined) {
        result = {
            width: targetWidth,
            height: Math.round(targetWidth / aspectRatio),
        };
    }
    // If target height is provided, calculate the width
    else if (targetHeight !== undefined) {
        result = {
            width: Math.round(targetHeight * aspectRatio),
            height: targetHeight,
        };
    }

    return result;
}

async function getImageHeight(
    image: Blob,
    targetWidth: number,
): Promise<number> {
    const { width, height } = await calculateImageSize(image);
    const dimensions = calculateDimensionWithAspectRatio(
        width,
        height,
        targetWidth,
    );
    return dimensions.height;
}

/**
 * Create a DOCX document from a report
 * @param report - The report to convert to DOCX
 * @param createdAtLabel - Optional label for "Created at" (defaults to German)
 * @returns Promise<Blob> containing the DOCX document
 */
export async function createDoxf(
    report: IReport,
    createdAtLabel = "Erstellt am",
): Promise<Blob> {
    console.log(report.complaints.map((c) => toRaw(c.toDto())));

    const asycComplainParagraphs = report.complaints.map(
        async (complaint) => await renderComplaint(complaint),
    );

    const complainParagraphs = (
        await Promise.all(asycComplainParagraphs)
    ).flat();

    const doc = new Document({
        numbering: {
            config: [
                {
                    reference: "complaint-numbering",
                    levels: [
                        {
                            level: 0,
                            format: NumberFormat.DECIMAL,
                            text: "%1.",
                            alignment: AlignmentType.START,
                        },
                    ],
                },
            ],
        },
        sections: [
            {
                children: [
                    new Paragraph({
                        text: report.name,
                        heading: "Title",
                    }),
                    new Paragraph({
                        text: `${createdAtLabel}: ${report.createdAt.toLocaleString()}`,
                    }),
                    new Paragraph({
                        text: `${report.subtitle1}`,
                    }),
                    new Paragraph({
                        text: `${report.subtitle2}`,
                    }),
                    ...complainParagraphs,
                ],
            },
        ],
    });

    return await Packer.toBlob(doc);
}

async function renderComplaint(complaint: IComplaint) {
    return [
        new Paragraph({
            text: `${complaint.title}`,
            heading: "Heading1",
            numbering: { level: 0, reference: "complaint-numbering" },
            keepLines: true,
            keepNext: true,
        }),
        ...(await Promise.all(
            complaint.items.map((item) => renderComplaintItem(item)),
        )),
    ];
}

async function renderComplaintItem(item: IComplaintItem) {
    switch (item.$type) {
        case "text":
            return renderComplaintText(item as ComplaintText);
        case "recording":
            return renderComplaintRecording(item as ComplaintRecording);
        case "image":
            return renderComplaintImage(item as ComplaintImage);
        default:
            throw new Error("Unknown complaint item type");
    }
}

async function renderComplaintText(item: ComplaintText) {
    return new Paragraph({
        text: item.text,
        spacing: { after: 6 * 20 },
    });
}

async function renderComplaintRecording(item: ComplaintRecording) {
    return new Paragraph({
        text: item.text,
        spacing: { after: 6 * 20 },
    });
}

async function renderComplaintImage(item: ComplaintImage) {
    const blob = item.image.image;

    return new Paragraph({
        children: [
            new ImageRun({
                type: "png",
                data: await blob.arrayBuffer(),
                transformation: {
                    width: 600,
                    height: await getImageHeight(blob, 600),
                },
            }),
        ],
        alignment: "center",
        spacing: { after: 12 * 20 },
    });
}

// async function getImages(complaint: IComplaint) {
//     return Promise.all(
//         complaint.images.map(async (image) => {
//             return new Paragraph({
//                 children: [
//                     new ImageRun({
//                         type: "png",
//                         data: await image.image.arrayBuffer(),
//                         transformation: {
//                             width: 600,
//                             height: await getImageHeight(image.image, 600),
//                         },
//                     }),
//                 ],
//                 alignment: "center",
//                 spacing: { after: 12 * 20 },
//             });
//         }),
//     );
// }
