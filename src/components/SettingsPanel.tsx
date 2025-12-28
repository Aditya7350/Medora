'use client';

import Dropzone from './Dropzone';
import styles from './SettingsPanel.module.css';

interface SettingsPanelProps {
    onLogoSelect: (file: File) => void;
    onFooterSelect: (file: File) => void;
    logoFile: File | null;
    footerFile: File | null;
}

export default function SettingsPanel({ onLogoSelect, onFooterSelect, logoFile, footerFile }: SettingsPanelProps) {
    return (
        <div className={`glass-panel ${styles.settings}`}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                Branding Settings
            </h2>

            <div className={styles.section}>
                <h3>Company Logo</h3>
                <p className={styles.description}>Upload a PNG or JPG logo (top-left)</p>
                <div className={styles.uploadArea}>
                    <Dropzone onFileSelect={onLogoSelect} accept="image/png, image/jpeg" label="Drop Logo" />
                    {logoFile && <div className={styles.preview}>Selected: {logoFile.name}</div>}
                </div>
            </div>

            <div className={styles.section}>
                <h3>Footer Image</h3>
                <p className={styles.description}>Upload a PNG or JPG footer (bottom-center)</p>
                <div className={styles.uploadArea}>
                    <Dropzone onFileSelect={onFooterSelect} accept="image/png, image/jpeg" label="Drop Footer" />
                    {footerFile && <div className={styles.preview}>Selected: {footerFile.name}</div>}
                </div>
            </div>
        </div>
    );
}
