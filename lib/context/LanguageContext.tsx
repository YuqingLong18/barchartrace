'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const TRANSLATIONS: Record<string, Record<Language, string>> = {
    "app.title": { en: "Bar Chart Race Generator", zh: "动态条形图生成器" },
    "app.subtitle": { en: "Generate animated bar chart races from natural language prompts.", zh: "通过自然语言提示生成动态条形图竞赛。" },
    "prompt.placeholder": { en: "e.g. GDP of Top 10 Countries 1960-2024", zh: "例如：1960-2024年排名前10国家的GDP" },
    "btn.generate": { en: "Generate Race", zh: "生成图表" },
    "btn.generating": { en: "Generating...", zh: "生成中..." },
    "btn.save": { en: "Save to Gallery", zh: "保存到画廊" },
    "btn.saving": { en: "Saving...", zh: "保存中..." },
    "btn.discard": { en: "Discard", zh: "丢弃" },
    "gallery.title": { en: "Gallery", zh: "画廊" },
    "gallery.empty": { en: "No saved charts yet.", zh: "暂无保存的图表。" },
    "gallery.delete_confirm": { en: "Are you sure you want to delete this chart?", zh: "确定要删除此图表吗？" },
    "controls.play": { en: "Play", zh: "播放" },
    "controls.pause": { en: "Pause", zh: "暂停" },
    "controls.replay": { en: "Replay", zh: "重播" },
    "msg.prompt_empty": { en: "Please enter a prompt.", zh: "请输入提示词。" },
    "msg.error": { en: "An error occurred. Please try again.", zh: "发生错误，请重试。" },
    "msg.saved": { en: "Chart saved to gallery!", zh: "图表已保存到画廊！" },
    "msg.save_fail": { en: "Failed to save chart.", zh: "保存失败。" },
    "ph.start": { en: "Enter a prompt above or select a saved chart below.", zh: "在上方输入提示词或从下方选择已保存的图表。" },
    "ph.source": { en: "Source", zh: "来源" }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return TRANSLATIONS[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
