'use client';

import { useState } from 'react';
import Dropzone from '@/components/Dropzone';
import UrlInput from '@/components/UrlInput';
import SettingsPanel from '@/components/SettingsPanel';
import { processPdf } from '@/utils/pdf-processor';
import styles from './page.module.css';

export default function Dashboard() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    try {
      const processedBytes = await processPdf({ pdfFile, logoFile: logoFile || undefined, footerFile: footerFile || undefined });
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
      // Fallback: WhatsApp Link (text only, can't attach file directly via web link easily)
      // Or just prompt to download.
      alert("Web Share API not supported on this device. Please download and share manually.");
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
        <aside className={styles.sidebar}>
          <SettingsPanel
            onLogoSelect={setLogoFile}
            onFooterSelect={setFooterFile}
            logoFile={logoFile}
            footerFile={footerFile}
          />
        </aside>

        <main className={styles.mainArea}>
          {!pdfFile ? (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              <div className={styles.previewHeader}>
                <h3>{pdfFile.name}</h3>
                <button onClick={() => setPdfFile(null)} className={styles.textBtn}>Remove</button>
              </div>

              {processedPdfUrl ? (
                <iframe src={processedPdfUrl} style={{ width: '100%', flex: 1, border: 'none', borderRadius: '0.5rem' }} />
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '4rem' }}>📄</div>
                  <p>Ready to process</p>
                  <button onClick={handleProcess} disabled={isProcessing} className={`${styles.button} ${styles.primary} ${styles.large}`}>
                    {isProcessing ? 'Processing...' : 'Apply Branding & Generate'}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
