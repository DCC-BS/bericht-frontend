import { Document, Footer, ImageRun, NumberFormat, Packer, PageNumber, Paragraph, TextRun } from "docx";
import type { IComplaint } from "~/models/complaint";
import type { IReport } from "~/models/report";

/**
 * Calculates the dimensions of an image from a Blob
 * @param imageBlob - The image as a Blob object
 * @returns Promise with the width and height of the image
 */
async function calculateImageSize(imageBlob: Blob): Promise<{ width: number; height: number }> {
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
                height: img.height
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
    targetHeight?: number
): { width: number; height: number } {
    // Calculate the aspect ratio
    const aspectRatio = originalWidth / originalHeight;
    
    // Initialize result object
    let result = { 
        width: originalWidth, 
        height: originalHeight 
    };
    
    // If target width is provided, calculate the height
    if (targetWidth !== undefined) {
        result = {
            width: targetWidth,
            height: Math.round(targetWidth / aspectRatio)
        };
    }
    // If target height is provided, calculate the width
    else if (targetHeight !== undefined) {
        result = {
            width: Math.round(targetHeight * aspectRatio),
            height: targetHeight
        };
    }
    
    return result;
}

async function getImageHeight(image: Blob, targetWidth: number): Promise<number> {
    const { width, height } = await calculateImageSize(image);
    const dimensions = calculateDimensionWithAspectRatio(width, height, targetWidth);
    return dimensions.height;
}

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
                            height: await getImageHeight(image.image, 600)
                        },
                    }),
                ],
                alignment: "center",
                spacing: { after: 12 * 20 }
            });
        }),
    );
}
