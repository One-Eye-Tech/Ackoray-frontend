import { createI18n } from 'vue-i18n'
import zhMessages from './locales/zh.js'
import enMessages from './locales/en.js'

// 确保默认语言是中文
const DEFAULT_LANGUAGE = 'zh'

const i18n = createI18n({
  legacy: false, // 使用 Composition API 方式
  globalInjection: true, // 全局注入 $t, $d 等方法
  locale: localStorage.getItem('language') || DEFAULT_LANGUAGE, // 从本地存储获取语言或默认为中文
  fallbackLocale: DEFAULT_LANGUAGE, // 如果没有找到对应的翻译，回退到中文
  messages: {
    zh: zhMessages,
    en: enMessages
  },
  silentFallbackWarn: true, // 静默处理回退警告
  missingWarn: false // 禁用缺少翻译的警告
})

// 在初始化时强制检查并确保语言设置
const currentLanguage = localStorage.getItem('language')
if (!currentLanguage || (currentLanguage !== 'zh' && currentLanguage !== 'en')) {
  localStorage.setItem('language', DEFAULT_LANGUAGE)
  document.documentElement.lang = DEFAULT_LANGUAGE
  document.documentElement.classList.add(`lang-${DEFAULT_LANGUAGE}`)
}

export default i18n

// 提供一个更新语言的辅助函数
export function setLanguage(lang) {
  if (i18n.global.locale.value === lang) return
  
  i18n.global.locale.value = lang
  localStorage.setItem('language', lang)
  document.documentElement.lang = lang
  document.documentElement.classList.remove('lang-zh', 'lang-en')
  document.documentElement.classList.add(`lang-${lang}`)
  
  // 派发语言更改事件
  window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }))
} 