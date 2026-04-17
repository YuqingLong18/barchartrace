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
    "btn.logout": { en: "Logout", zh: "退出登录" },
    "gallery.title": { en: "Gallery", zh: "画廊" },
    "gallery.empty": { en: "No saved charts yet.", zh: "暂无保存的图表。" },
    "gallery.loading": { en: "Loading gallery...", zh: "画廊加载中..." },
    "gallery.delete_confirm": { en: "Are you sure you want to delete this chart?", zh: "确定要删除此图表吗？" },
    "gallery.delete": { en: "Delete", zh: "删除" },
    "controls.play": { en: "Play", zh: "播放" },
    "controls.pause": { en: "Pause", zh: "暂停" },
    "controls.replay": { en: "Replay", zh: "重播" },
    "msg.prompt_empty": { en: "Please enter a prompt.", zh: "请输入提示词。" },
    "msg.error": { en: "An error occurred. Please try again.", zh: "发生错误，请重试。" },
    "msg.saved": { en: "Chart saved to gallery!", zh: "图表已保存到画廊！" },
    "msg.save_fail": { en: "Failed to save chart.", zh: "保存失败。" },
    "ph.start": { en: "Enter a prompt above or select a saved chart below.", zh: "在上方输入提示词或从下方选择已保存的图表。" },
    "ph.source": { en: "Source", zh: "来源" },
    "login.title": { en: "Teacher sign-in", zh: "教师登录" },
    "login.subtitle": { en: "Bar Chart Race supports the shared THIS Nexus Microsoft sign-in and still keeps the centralized legacy account path for existing users. Student Microsoft accounts are not allowed in this app.", zh: "Bar Chart Race 支持 THIS Nexus 共享的 Microsoft 单点登录，也保留给现有用户使用的统一原有账户入口。学生 Microsoft 账号不可进入此应用。" },
    "login.continue_microsoft": { en: "Continue With Microsoft", zh: "使用 Microsoft 登录" },
    "login.helper": { en: "Use your school Microsoft account to continue, or open the legacy form if you still use the old central account.", zh: "请使用学校 Microsoft 账号继续，若仍使用原有统一账户，可展开下方旧入口。" },
    "login.show_legacy": { en: "Sign In The Old Way", zh: "使用原有账户登录" },
    "login.hide_legacy": { en: "Hide legacy form", zh: "收起原有账户表单" },
    "login.username": { en: "Username", zh: "用户名" },
    "login.password": { en: "Password", zh: "密码" },
    "login.submit_legacy": { en: "Sign In", zh: "登录" },
    "login.submitting_legacy": { en: "Signing in...", zh: "登录中..." },
    "login.error_required": { en: "Username and password are required.", zh: "请输入用户名和密码。" },
    "login.error_invalid": { en: "Invalid credentials.", zh: "用户名或密码错误。" },
    "login.error_unavailable": { en: "Authentication service unavailable.", zh: "认证服务不可用。" },
    "login.teacher_only": { en: "Teacher Microsoft account required. If the email contains any digit, the shared SSO marks it as a student account and access is denied.", zh: "需要教师 Microsoft 账号。如果邮箱中包含任意数字，共享单点登录会将其判定为学生账号，因此无法访问。" },
    "login.checking": { en: "Checking existing Microsoft session...", zh: "正在检查现有 Microsoft 登录状态..." },
    "login.current_account": { en: "Current account", zh: "当前账户" },
    "login.current_account_student": { en: "This browser is currently signed in with a student-tagged Microsoft account.", zh: "当前浏览器登录的是被标记为学生的 Microsoft 账号。" },
    "login.current_account_teacher": { en: "A teacher Microsoft account is already present in this browser.", zh: "当前浏览器中已存在教师 Microsoft 账号。" },
    "login.switch_account": { en: "Sign out and switch account", zh: "退出并切换账号" },
    "login.switching": { en: "Signing out...", zh: "正在退出..." },
    "login.back_nexus": { en: "Back to THIS Nexus", zh: "返回 THIS Nexus" },
    "login.unknown_user": { en: "Unknown user", zh: "未知用户" },
    "login.no_email": { en: "No email available", zh: "未获取到邮箱" }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('zh');

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('preferredLang', lang);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = window.localStorage.getItem('preferredLang');
        if (stored === 'en' || stored === 'zh') {
            setLanguageState(stored);
        }
    }, []);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = language;
        }
    }, [language]);

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
