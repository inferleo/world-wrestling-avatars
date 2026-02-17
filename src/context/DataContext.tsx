"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WRESTLERS as INITIAL_WRESTLERS, Wrestler } from '@/data';
import { db } from '@/lib/firebase';
import {
    collection,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy
} from 'firebase/firestore';
import { uploadFile } from '@/lib/storage';

interface DataContextType {
    wrestlers: Wrestler[];
    awards: AwardCategory[];
    siteConfig: SiteConfig;
    addWrestler: (wrestler: Wrestler, imageFile?: File) => Promise<void>;
    updateWrestler: (updatedWrestler: Wrestler, imageFile?: File) => Promise<void>;
    deleteWrestler: (id: string) => Promise<void>;
    updateSiteConfig: (config: SiteConfig, logoFile?: File) => Promise<void>;
    news: NewsItem[];
    addNews: (item: NewsItem, imageFile?: File) => Promise<void>;
    deleteNews: (id: string) => Promise<void>;
    addAward: (award: AwardCategory) => Promise<void>;
    updateAward: (award: AwardCategory) => Promise<void>;
    deleteAward: (id: string) => Promise<void>;
    isLoading: boolean;
}

export interface SiteConfig {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    featuredWrestlerId: string;
    welcomeMessage: string;
    logoImage?: string;
    showResults?: boolean;
}

export interface NewsItem {
    id: string;
    title: string;
    content: string;
    image: string;
    date: string;
}

const INITIAL_SITE_CONFIG: SiteConfig = {
    heroTitle: "World Wrestling Avatars",
    heroSubtitle: "THE ARENA IS SET. LEGENDS RISE.",
    heroDescription: "JOIN THE REVOLUTION.",
    featuredWrestlerId: "1", // Titan Rex
    welcomeMessage: "The premier destination for wrestling voting and stats.",
    logoImage: "", // Empty string means use default text/icon
    showResults: false
};

export interface AwardCategory {
    id: string;
    title: string;
    candidateIds: string[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [awards, setAwards] = useState<AwardCategory[]>([]);
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize & Sync Data from Firestore
    useEffect(() => {
        let isFirstRun = true;

        // 1. Sync Wrestlers
        const unsubWrestlers = onSnapshot(query(collection(db, 'wrestlers'), orderBy('name')), (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as Wrestler);
            setWrestlers(data);

            // Seed if empty on first run
            if (isFirstRun && data.length === 0) {
                INITIAL_WRESTLERS.forEach(w => {
                    setDoc(doc(db, 'wrestlers', w.id), w);
                });
            }
        });

        // 2. Sync Awards
        const unsubAwards = onSnapshot(collection(db, 'awards'), (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as AwardCategory);
            setAwards(data);
        });

        // 3. Sync News
        const unsubNews = onSnapshot(query(collection(db, 'news'), orderBy('date', 'desc')), (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as NewsItem);
            setNews(data);
        });

        // 4. Sync Config
        const unsubConfig = onSnapshot(doc(db, 'siteConfig', 'config'), (snapshot) => {
            if (snapshot.exists()) {
                setSiteConfig(snapshot.data() as SiteConfig);
            } else if (isFirstRun) {
                setDoc(doc(db, 'siteConfig', 'config'), INITIAL_SITE_CONFIG);
            }
        });

        setIsLoading(false);
        isFirstRun = false;

        return () => {
            unsubWrestlers();
            unsubAwards();
            unsubNews();
            unsubConfig();
        };
    }, []);

    const updateSiteConfig = async (newConfig: SiteConfig, logoFile?: File) => {
        let finalConfig = { ...newConfig };

        if (logoFile) {
            const logoUrl = await uploadFile(logoFile, `site/logo_${Date.now()}`);
            finalConfig.logoImage = logoUrl;
        }

        setSiteConfig(finalConfig);
        await setDoc(doc(db, 'siteConfig', 'config'), finalConfig);
    };

    const addWrestler = async (wrestler: Wrestler, imageFile?: File) => {
        let finalWrestler = { ...wrestler };

        if (imageFile) {
            const imageUrl = await uploadFile(imageFile, `superstars/${wrestler.id || Date.now()}`);
            finalWrestler.image = imageUrl;
        }

        await setDoc(doc(db, 'wrestlers', finalWrestler.id), finalWrestler);
    };

    const updateWrestler = async (updatedWrestler: Wrestler, imageFile?: File) => {
        let finalWrestler = { ...updatedWrestler };

        if (imageFile) {
            const imageUrl = await uploadFile(imageFile, `superstars/${updatedWrestler.id}`);
            finalWrestler.image = imageUrl;
        }

        await setDoc(doc(db, 'wrestlers', finalWrestler.id), finalWrestler);
    };

    const deleteWrestler = async (id: string) => {
        await deleteDoc(doc(db, 'wrestlers', id));

        // Also remove from awards
        const affectedAwards = awards.filter(a => a.candidateIds.includes(id));
        for (const award of affectedAwards) {
            await updateDoc(doc(db, 'awards', award.id), {
                candidateIds: award.candidateIds.filter(cId => cId !== id)
            });
        }
    };

    const addAward = async (award: AwardCategory) => {
        await setDoc(doc(db, 'awards', award.id), award);
    };

    const updateAward = async (updatedAward: AwardCategory) => {
        await setDoc(doc(db, 'awards', updatedAward.id), updatedAward);
    };

    const deleteAward = async (id: string) => {
        await deleteDoc(doc(db, 'awards', id));
    };

    const addNews = async (item: NewsItem, imageFile?: File) => {
        let finalNews = { ...item };

        if (imageFile) {
            const imageUrl = await uploadFile(imageFile, `news/${item.id || Date.now()}`);
            finalNews.image = imageUrl;
        }

        await setDoc(doc(db, 'news', finalNews.id), finalNews);
    };

    const deleteNews = async (id: string) => {
        await deleteDoc(doc(db, 'news', id));
    };

    return (
        <DataContext.Provider value={{ wrestlers, awards, siteConfig, news, addWrestler, updateWrestler, deleteWrestler, updateSiteConfig, addNews, deleteNews, addAward, updateAward, deleteAward, isLoading }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
