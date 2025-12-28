'use client';

import { useState, useCallback, useRef } from 'react';
import styles from './Dropzone.module.css';

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    label?: string;
}

export default function Dropzone({ onFileSelect, accept = 'application/pdf', label = 'Drop PDF here' }: DropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className={`${styles.dropzone} ${isDragOver ? styles.active : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                hidden
            />
            <div className={styles.icon}>📄</div>
            <p>{label}</p>
            <small>or click to upload</small>
        </div>
    );
}
