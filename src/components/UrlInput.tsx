'use client';

import { useState } from 'react';
import styles from './UrlInput.module.css';

interface UrlInputProps {
    onFileLoaded: (file: File) => void;
}

export default function UrlInput({ onFileLoaded }: UrlInputProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
        if (!url) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/proxy-pdf?url=${encodeURIComponent(url)}`);
            if (!res.ok) throw new Error('Failed to fetch');

            const blob = await res.blob();
            const file = new File([blob], "imported-document.pdf", { type: 'application/pdf' });
            onFileLoaded(file);
            setUrl('');
        } catch (error) {
            alert("Could not load PDF from URL. Please ensure it is a public direct link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <input
                type="text"
                placeholder="Paste Google Drive or PDF Link..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={styles.input}
            />
            <button
                onClick={handleFetch}
                disabled={loading || !url}
                className={styles.button}
            >
                {loading ? '...' : 'Import'}
            </button>
        </div>
    );
}
