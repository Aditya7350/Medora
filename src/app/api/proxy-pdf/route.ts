import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    let targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic Google Drive Link Converter
    // From: https://drive.google.com/file/d/ID/view...
    // To: https://drive.google.com/uc?export=download&id=ID
    const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = targetUrl.match(driveRegex);
    if (match && match[1]) {
        targetUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', 'attachment; filename="downloaded.pdf"');

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 });
    }
}
