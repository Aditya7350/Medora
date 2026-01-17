'use client';

import Dropzone from '@/components/Dropzone';
import UrlInput from '@/components/UrlInput';
import { processPdf } from '@/utils/pdf-processor';
import styles from './page.module.css';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-process when pdfFile changes
  useEffect(() => {
    if (pdfFile) {
      handleProcess();
    }
  }, [pdfFile]);

  const handleProcess = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    try {
      // Fetch assets
      const [logoBuffer, footerBuffer] = await Promise.all([
        fetch('/assets/Logo.png').then(res => res.ok ? res.arrayBuffer() : undefined).catch(() => undefined),
        fetch('/assets/Footer.png').then(res => res.ok ? res.arrayBuffer() : undefined).catch(() => undefined)
      ]);

      const processedBytes = await processPdf({
        pdfFile,
        logoBuffer,
        footerBuffer
      });

      const blob = new Blob([processedBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setProcessedPdfUrl(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. See console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!processedPdfUrl) return;

    // Fetch blob again to share file
    const blob = await fetch(processedPdfUrl).then(r => r.blob());
    const file = new File([blob], "patient-report.pdf", { type: 'application/pdf' });

    if (navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: 'Patient Report',
          text: 'Here is the processed patient report.'
        });
      } catch (err) {
        console.log("Share failed or canceled", err);
      }
    } else {
      // Fallback for Desktop: Suggest downloading or using WhatsApp Web manually
      const waUrl = "https://web.whatsapp.com/";
      if (confirm("Direct file sharing is only supported on mobile or compatible devices. \n\nClick OK to open WhatsApp Web so you can attach the downloaded file manually.")) {
        window.open(waUrl, '_blank');
      }
    }
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className="glass-panel" style={{ padding: '1rem 2rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className={styles.title}>Patient Report System</h1>
          {processedPdfUrl && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href={processedPdfUrl} download="patient_report_processed.pdf" className={styles.button}>
                Download
              </a>
              <button onClick={handleShare} className={`${styles.button} ${styles.primary}`}>
                Share via WhatsApp
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.content}>
        <main className={styles.mainArea} style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          {!pdfFile ? (
            <div className="glass-panel" style={{ height: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Dropzone onFileSelect={setPdfFile} label="Upload Patient Report (PDF)" />
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '1.5rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'hsl(var(--border))' }}></div>
                <span style={{ padding: '0 1rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'hsl(var(--border))' }}></div>
              </div>
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <UrlInput onFileLoaded={setPdfFile} />
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              <div className={styles.previewHeader}>
                <h3>{pdfFile.name}</h3>
                <button onClick={() => { setPdfFile(null); setProcessedPdfUrl(null); }} className={styles.textBtn}>Start Over</button>
              </div>

              {processedPdfUrl ? (
                <iframe src={processedPdfUrl} style={{ width: '100%', flex: 1, border: 'none', borderRadius: '0.5rem' }} />
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '4rem' }}>⚙️</div>
                  <p>Processing...</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
