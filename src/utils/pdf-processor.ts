import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface ProcessPdfOptions {
    pdfFile: File;
    logoFile?: File;
    footerFile?: File;
}

export async function processPdf({ pdfFile, logoFile, footerFile }: ProcessPdfOptions): Promise<Uint8Array> {
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    let logoImage;
    let footerImage;

    if (logoFile) {
        const logoBytes = await logoFile.arrayBuffer();
        // Try to embed PNG first, then JPG if fails (simplified for now, ideally check mime type)
        try {
            logoImage = await pdfDoc.embedPng(logoBytes);
        } catch {
            logoImage = await pdfDoc.embedJpg(logoBytes);
        }
    }

    if (footerFile) {
        const footerBytes = await footerFile.arrayBuffer();
        try {
            footerImage = await pdfDoc.embedPng(footerBytes);
        } catch {
            footerImage = await pdfDoc.embedJpg(footerBytes);
        }
    }

    for (const page of pages) {
        const { width, height } = page.getSize();

        // Draw Logo at Top Right (or Left?) - Let's say Top Right for standard report
        if (logoImage) {
            const logoDims = logoImage.scale(0.25);
            page.drawImage(logoImage, {
                x: 20, // Left aligned
                y: height - logoDims.height - 15, // Top aligned
                width: logoDims.width,
                height: logoDims.height,
            });
        }

        // Draw Footer at Bottom Center
        if (footerImage) {
            // Scale to fit width, maybe? Or keep original aspect ratio but small
            // Let's assume full width footer or centered image
            const footerDims = footerImage.scale(0.2);
            page.drawImage(footerImage, {
                x: (width - footerDims.width) / 2,
                y: 20,
                width: footerDims.width,
                height: footerDims.height,
            });
        }
    }

    return await pdfDoc.save();
}
