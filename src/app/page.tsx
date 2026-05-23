// src/app/page.js
"use client";
import HomeScrollExperience from '@/components/features/HomeScrollExperience';
import styles from './home.module.css';

export default function HomePage() {
    return (
        <div className={styles.scholarlyTheme}>
            <HomeScrollExperience />
        </div>
    );
}
