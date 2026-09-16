/**
 * Translation Service for Tschüss
 * Translates the whole website using the Google Translate Web API
 * and provides on-demand text translation via public REST Translation API.
 */

// Global window typing for Google Translate
declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

class TranslationService {
  private isScriptLoaded = false;
  private isTranslating = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initScript();
    }
  }

  /**
   * Initializes the Google Website Translator script
   */
  public initScript() {
    if (typeof window === 'undefined' || this.isScriptLoaded) return;

    // Set global initialization callback
    window.googleTranslateElementInit = () => {
      try {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,de',
              layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE,
              autoDisplay: false
            },
            'google_translate_element'
          );
        }
      } catch (e) {
        console.warn('Google translate element init:', e);
      }
    };

    // Check if script tag already exists
    const existing = document.getElementById('google-translate-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(script);
    }
    this.isScriptLoaded = true;
  }

  /**
   * Translates the entire website into the target language ('de' or 'en')
   * using the Google Translation Engine.
   */
  public translateWholeWebsite(targetLang: 'de' | 'en') {
    if (typeof window === 'undefined') return;

    try {
      this.isTranslating = true;
      const domain = window.location.hostname;

      if (targetLang === 'de') {
        // Set cookies for Google Translate API
        document.cookie = `googtrans=/en/de; path=/; domain=${domain}`;
        document.cookie = `googtrans=/en/de; path=/;`;
        document.cookie = `googtrans=/auto/de; path=/; domain=${domain}`;
        document.cookie = `googtrans=/auto/de; path=/;`;

        // If the Google Translate combo box is mounted in the DOM, select German
        const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
        if (select) {
          select.value = 'de';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // If not mounted yet, ensure initScript is called
          this.initScript();
          // Trigger combo when loaded
          setTimeout(() => {
            const retrySelect = document.querySelector<HTMLSelectElement>('.goog-te-combo');
            if (retrySelect) {
              retrySelect.value = 'de';
              retrySelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, 600);
        }
      } else {
        // Revert to English / Original
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `googtrans=/en/en; path=/; domain=${domain}`;
        document.cookie = `googtrans=/en/en; path=/;`;

        const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
        if (select) {
          select.value = 'en';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } catch (err) {
      console.warn('Error invoking whole website translation:', err);
    } finally {
      this.isTranslating = false;
    }
  }

  /**
   * REST Translation API fallback to translate individual text phrases dynamically
   */
  public async translateTextViaApi(text: string, targetLang = 'de'): Promise<string> {
    if (!text || text.trim() === '') return text;
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
      const res = await fetch(url);
      if (!res.ok) return text;
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
      return text;
    } catch (e) {
      console.warn('API text translation error:', e);
      return text;
    }
  }
}

export const translationService = new TranslationService();
