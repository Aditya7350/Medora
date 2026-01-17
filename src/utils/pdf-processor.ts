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
            const qrSize = 70;
            const leftMargin = 20;
            // Header area is 150px tall, starting at height - 150
            const headerTopY = height - 150;

            // Center vertically: (150 - 70) / 2 = 40
            const centeredPadding = (150 - qrSize) / 2;

            page.drawImage(qrImage, {
                x: leftMargin,
                y: headerTopY + centeredPadding,
                width: qrSize,
                height: qrSize
            });
        }
    }

    return await pdfDoc.save();
}
