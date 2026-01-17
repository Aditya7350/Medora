import { PDFDocument } from 'pdf-lib';

interface ProcessPdfOptions {
    pdfFile: File;
    logoBuffer?: ArrayBuffer;
    footerBuffer?: ArrayBuffer;
}

export async function processPdf({
    pdfFile,
    logoBuffer,
    footerBuffer,
}: ProcessPdfOptions): Promise<Uint8Array> {

    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    let logoImage;
    let footerImage;

    if (logoBuffer) {
        try {
            logoImage = await pdfDoc.embedPng(logoBuffer);
        } catch {
            logoImage = await pdfDoc.embedJpg(logoBuffer);
        }
    }

    if (footerBuffer) {
        try {
            footerImage = await pdfDoc.embedPng(footerBuffer);
        } catch {
            footerImage = await pdfDoc.embedJpg(footerBuffer);
        }
    }

    for (const page of pages) {
        const { width, height } = page.getSize();
        const HEADER_HEIGHT = 150;


        if (logoImage) {
            const margin = 1;
            const headerTopPadding = 5;
            const maxLogoWidth = 300;
            const maxLogoHeight = 240;

            const { width: imgW, height: imgH } = logoImage;

            const scale = Math.min(
                maxLogoWidth / imgW,
                maxLogoHeight / imgH
            );

            const logoWidth = imgW * scale;
            const logoHeight = imgH * scale;
            const headerTopY = height - HEADER_HEIGHT;
            page.drawImage(logoImage, {
                x: width - logoWidth - margin,
                // y: height - logoHeight - margin - headerTopPadding,
                y: headerTopY + (HEADER_HEIGHT - logoHeight) / 2 + headerTopPadding,
                width: logoWidth,
                height: logoHeight,
            });
        }

        if (footerImage) {
            const bottomMargin = 20;
            const footerHeight = 850;

            const scale = footerHeight / footerImage.height;
            const footerWidth = footerImage.width * scale;

            page.drawImage(footerImage, {
                x: (width - footerWidth) / 2,
                y: bottomMargin,
                width: footerWidth,
                height: footerHeight,
            });
        }
    }

    return await pdfDoc.save();
}
