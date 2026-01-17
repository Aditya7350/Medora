import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';

interface ProcessPdfOptions {
    pdfFile: File;
    logoBuffer?: ArrayBuffer;
    footerBuffer?: ArrayBuffer;
    qrData?: string;
}

export async function processPdf({
    pdfFile,
    logoBuffer,
    footerBuffer,
    qrData,
}: ProcessPdfOptions): Promise<Uint8Array> {

    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    let logoImage;
    let footerImage;
    let qrImage;

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

    if (qrData) {
        const qrDataUrl = await QRCode.toDataURL(qrData);
        // data:image/png;base64,...
        const qrBytes = await fetch(qrDataUrl).then(res => res.arrayBuffer());
        qrImage = await pdfDoc.embedPng(qrBytes);
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
                y: headerTopY + (HEADER_HEIGHT - logoHeight) / 2 + headerTopPadding,
                width: logoWidth,
                height: logoHeight,
            });
        }

        const bottomMargin = 20;
        const footerHeight = 850;

        if (footerImage) {
            const scale = footerHeight / footerImage.height;
            const footerWidth = footerImage.width * scale;

            page.drawImage(footerImage, {
                x: (width - footerWidth) / 2,
                y: bottomMargin,
                width: footerWidth,
                height: footerHeight,
            });
        }

        if (qrImage) {
            const qrSize = 100;
            const qrPadding = 10;
            // Position above footer. 
            // NOTE: It seems footerHeight (850) is very large in previous code, possibly scaled down? 
            // Looking at previous code: `footerHeight = 850` and `y: bottomMargin` (20).
            // This suggests the footer is huge? Or maybe the user meant width?
            // Re-reading previous code: `footerHeight = 850`. That seems wrong for a footer height unless the image is massive and scaled?
            // Wait, previous code: `const scale = footerHeight / footerImage.height; const footerWidth = footerImage.width * scale;`
            // It sets DRAW height to 850. That's almost the whole page (A4 is ~842 pts).
            // This looks suspicious. `footerImage` drawing y is 20. height is 850.
            // If the footer is a full page background or watermark, this makes sense.
            // If it's just a bottom footer, 850 is way too big. 
            // Let's assume the previous code works as the user wanted (maybe it's a letterhead background?).
            // For QR code above footer, if footer covers the page, we should probably place it at the bottom but arguably visible.
            // If footer is truly a footer, 850 height is weird.
            // I'll assume for now to place it at the bottom right or left, slightly above the absolute bottom margin if the footer is indeed a background.
            // OR if the footer is a small bar, I'll place it above.
            // Let's position it at x: 50, y: 150 for now (above where a typical footer might be).
            // Actually, safe bet is bottom right or left corner. Let's do bottom right.

            page.drawImage(qrImage, {
                x: width - qrSize - 50,
                y: 100, // Fixed height from bottom for now
                width: qrSize,
                height: qrSize
            });
        }
    }

    return await pdfDoc.save();
}
