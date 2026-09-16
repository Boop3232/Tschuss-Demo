/**
 * Open-Source Translation Service for Tschüss
 * Powered by LibreTranslate (Open Source Machine Translation - AGPLv3)
 * with MyMemory open API fallback, pre-compiled UI dictionary,
 * and high-performance in-memory + LocalStorage caching.
 */

// Common UI dictionary for instant, zero-latency translations
const COMMON_DICTIONARY: Record<string, string> = {
  // Brand & Slogan
  'Tschüss': 'Tschüss',
  'Connecting Retailers and Consumers to Profit from Near Food Expiry': 'Verbindung von Einzelhändlern und Konsumenten zur Rettung von Fast-Ablauf-Lebensmitteln',
  'Good products deserve a second chance.': 'Gute Produkte verdienen eine zweite Chance.',
  'Rescue delicious near-expiry food at up to 70% off.': 'Rette köstliche Fast-Ablauf-Lebensmittel mit bis zu 70 % Rabatt.',

  // Navigation
  'Discover': 'Entdecken',
  'Search': 'Suche',
  'Map': 'Karte',
  'Saved': 'Gemerkt',
  'Reservations': 'Reservierungen',
  'Impact': 'Nachhaltigkeit',
  'Notifications': 'Mitteilungen',
  'Profile': 'Profil',
  'Retailer Portal': 'Händlerportal',
  'Business Portal': 'Händlerportal',
  'For Businesses': 'Für Händler',
  'How It Works': 'So funktioniert\'s',
  'FAQ': 'FAQ',
  'About': 'Über uns',
  'Log in': 'Anmelden',
  'Login': 'Anmelden',
  'Sign up': 'Registrieren',
  'Sign Up': 'Registrieren',
  'Log Out': 'Abmelden',
  'Logout': 'Abmelden',
  'Admin': 'Admin',
  'Switch Role': 'Rolle wechseln',
  'Switch to Retailer': 'Zu Händler wechseln',
  'Switch to Consumer': 'Zu Konsument wechseln',
  'Switch to Retailer (Dev)': 'Zu Händler wechseln (Dev)',
  'Switch to Consumer (Dev)': 'Zu Konsument wechseln (Dev)',
  'Dev Mode': 'Entwicklermodus',
  'Role': 'Rolle',

  // Categories
  'All Categories': 'Alle Kategorien',
  'All': 'Alle',
  'Grocery': 'Lebensmittel',
  'Bakery': 'Bäckerei',
  'Cosmetics': 'Kosmetik',
  'Flowers': 'Blumen',
  'Drinks': 'Getränke',
  'Household': 'Haushalt',
  'Dairy & Eggs': 'Milchprodukte & Eier',
  'Fruits & Vegetables': 'Obst & Gemüse',
  'Meat & Fish': 'Fleisch & Fisch',
  'Prepared Meals': 'Fertiggerichte',
  'Snacks & Sweets': 'Snacks & Süßwaren',
  'Other': 'Sonstiges',

  // Discover & Marketplace
  'Deals in': 'Angebote in',
  'Near You': 'In deiner Nähe',
  'Recommended Deals': 'Empfohlene Rettungs-Deals',
  'Active Deals': 'Aktive Angebote',
  'Partner Stores': 'Partner-Märkte',
  'CO2e Saved (kg)': 'CO2e eingespart (kg)',
  'Search products, stores or categories...': 'Produkte, Märkte oder Kategorien durchsuchen...',
  'Search products, stores...': 'Produkte oder Märkte suchen...',
  'Filter': 'Filtern',
  'Filters': 'Filter',
  'Clear all': 'Zurücksetzen',
  'Apply Filters': 'Filter anwenden',
  'Sort by': 'Sortieren nach',
  'Distance': 'Entfernung',
  'Discount': 'Rabatt',
  'Price: Low to High': 'Preis: aufsteigend',
  'Price: High to Low': 'Preis: absteigend',
  'Expiry Date': 'Ablaufdatum',
  'Urgency': 'Dringlichkeit',
  'Nearest': 'Nächste',

  // Product Card & Details
  'Reserve now': 'Jetzt reservieren',
  'Reserve Now': 'Jetzt reservieren',
  'Quick Reserve': 'Schnell reservieren',
  'Rescue Price': 'Rettungspreis',
  'Original Price': 'UVP',
  'Pick up by': 'Abholen bis',
  'Pickup Window': 'Abholfenster',
  'Pickup Deadline': 'Abholfrist',
  'Store': 'Markt',
  'Expires in': 'Läuft ab in',
  'Expires today': 'Läuft heute ab',
  'Expires tomorrow': 'Läuft morgen ab',
  'left': 'übrig',
  'left in stock': 'auf Lager',
  'OFF': 'RABATT',
  'Save': 'Merken',
  'Saved to favorites': 'Zu Favoriten hinzugefügt',
  'Removed from favorites': 'Aus Favoriten entfernt',
  'Get Directions': 'Route anzeigen',
  'View Details': 'Details anzeigen',
  'Product Details': 'Produktdetails',
  'Ingredients & Allergens': 'Zutaten & Allergene',
  'Storage Instructions': 'Lagerungshinweise',
  'Best Before Date': 'Mindesthaltbarkeitsdatum',
  'Use By Date': 'Verbrauchsdatum',

  // Reservation Dialog & States
  'Choose Quantity': 'Menge auswählen',
  'Total': 'Gesamt',
  'Total Amount': 'Gesamtbetrag',
  'Confirm Reservation': 'Reservierung bestätigen',
  'Reservation Confirmed!': 'Reservierung erfolgreich!',
  'Show this code to store staff upon collection.': 'Zeige diesen Code beim Marktpersonal vor.',
  'Reservation Code': 'Reservierungscode',
  'Reservation Details': 'Reservierungsdetails',
  'Cancel Reservation': 'Reservierung stornieren',
  'Active Reservations': 'Aktive Reservierungen',
  'Past Reservations': 'Vergangene Reservierungen',
  'Pending': 'Ausstehend',
  'Confirmed': 'Bestätigt',
  'Ready for Pickup': 'Abholbereit',
  'Ready': 'Abholbereit',
  'Collected': 'Abgeholt',
  'Completed': 'Abgeschlossen',
  'Cancelled': 'Storniert',
  'Expired': 'Abgelaufen',

  // Retailer Portal
  'Overview': 'Übersicht',
  'Products': 'Produkte',
  'Add Product': 'Produkt hinzufügen',
  'New Product': 'Neues Produkt',
  'Edit Product': 'Produkt bearbeiten',
  'Store Settings': 'Markteinstellungen',
  'Active Products': 'Aktive Produkte',
  'Products Rescued': 'Gerettete Artikel',
  'Revenue Recovered': 'Geretteter Umsatz',
  'CO2e Avoided': 'Vermeidetes CO2e',
  'Nearing Expiry': 'Kurz vor Ablauf',
  'Publish Product': 'Produkt veröffentlichen',
  'Save Changes': 'Änderungen speichern',
  'Mark Ready': 'Abholbereit melden',
  'Mark Collected': 'Als abgeholt markieren',
  'Verify Pickup Code': 'Abholcode prüfen',
  'Enter 6-digit code': '6-stelligen Code eingeben',

  // Location & Preferences
  'Current Location': 'Aktueller Standort',
  'Use Current Location': 'Meinen aktuellen Standort nutzen',
  'Search city or address...': 'Stadt oder Adresse suchen...',
  'Popular Cities': 'Beliebte Städte',
  'Change': 'Ändern',
  'Language Settings': 'Spracheinstellungen',
  'Application Language': 'Sprache der Anwendung',
  'English (EN)': 'Englisch (EN)',
  'Deutsch (DE)': 'Deutsch (DE)',
  'Save Preferences': 'Einstellungen speichern',
  'Saving...': 'Speichern...',
  'Preferences saved successfully!': 'Einstellungen erfolgreich gespeichert!',
  'Full Name': 'Vollständiger Name',
  'Email Address': 'E-Mail-Adresse',
  'Phone Number': 'Telefonnummer',
  'Notification Preferences': 'Benachrichtigungseinstellungen',
  'Deals near me': 'Angebote in meiner Nähe',
  'Reservation updates': 'Status-Updates zu Reservierungen',

  // Impact Dashboard
  'Your Sustainability Impact': 'Deine Nachhaltigkeitsbilanz',
  'Track your positive ecological and financial contribution through food rescue.': 'Verfolge deinen positiven ökologischen und finanziellen Beitrag durch Lebensmittelrettung.',
  'Money Saved': 'Geld gespart',
  'Stores Supported': 'Unterstützte Märkte',
  'Reservations Completed': 'Abgeschlossene Reservierungen',
  'Environmental Calculation Methodology': 'Methodik zur Umweltberechnung',

  // Empty states & general
  'No products found': 'Keine Produkte gefunden',
  'No deals match your selected filters.': 'Keine Angebote entsprechen deinen gewählten Filtern.',
  'Reset filters': 'Filter zurücksetzen',
  'Loading...': 'Wird geladen...',
  'Back': 'Zurück',
  'Close': 'Schließen',
  'Success': 'Erfolg',
  'Error': 'Fehler',
  'Yes': 'Ja',
  'No': 'Nein'
};

const CACHE_KEY = 'tschuess_trans_cache_v2';

class OpenSourceTranslationService {
  private cache: Map<string, string> = new Map();
  private originalNodeValues: WeakMap<Node, string> = new WeakMap();
  private observer: MutationObserver | null = null;
  private isTranslating = false;
  private currentLang: 'en' | 'de' = 'en';
  private batchQueue: Set<string> = new Set();
  private debounceTimer: any = null;

  constructor() {
    this.loadCache();
    // Pre-seed cache with common dictionary
    for (const [key, val] of Object.entries(COMMON_DICTIONARY)) {
      this.cache.set(this.normalize(key), val);
    }
  }

  private normalize(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  private loadCache() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string') {
            this.cache.set(k, v);
          }
        }
      }
    } catch {
      // Ignore cache load error
    }
  }

  private saveCache() {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, string> = {};
      // Save recent entries up to 800 items
      let count = 0;
      for (const [k, v] of this.cache.entries()) {
        if (count++ > 800) break;
        obj[k] = v;
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch {
      // Ignore quota error
    }
  }

  /**
   * Synchronous dictionary/cache lookup
   */
  public translateSync(text: string): string | null {
    if (!text) return null;
    const normalized = this.normalize(text);
    return this.cache.get(normalized) || COMMON_DICTIONARY[text] || COMMON_DICTIONARY[normalized] || null;
  }

  /**
   * Translate a single text string via LibreTranslate open source API,
   * falling back to MyMemory API.
   */
  public async translateText(text: string, targetLang = 'de'): Promise<string> {
    if (!text || text.trim() === '') return text;
    if (targetLang === 'en') return text;

    const normalized = this.normalize(text);
    const cached = this.translateSync(normalized);
    if (cached) return cached;

    // Do not translate pure numbers, currency values, codes, or tiny punctuation
    if (/^[\d\s€$.,%/:+-]+$/.test(normalized)) {
      return text;
    }

    // Try primary LibreTranslate open-source endpoint
    try {
      const res = await fetch('https://translate.disroot.org/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: normalized,
          source: 'en',
          target: targetLang,
          format: 'text'
        }),
        signal: AbortSignal.timeout(3500)
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.translatedText && typeof data.translatedText === 'string') {
          const result = data.translatedText.trim();
          this.cache.set(normalized, result);
          this.saveCache();
          return result;
        }
      }
    } catch {
      // Try secondary open translation API
    }

    // Secondary fallback: MyMemory Translated open REST API
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(normalized)}&langpair=en|${targetLang}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        if (data?.responseData?.translatedText && typeof data.responseData.translatedText === 'string') {
          const result = data.responseData.translatedText.trim();
          // Filter out API warnings
          if (!result.includes('MYMEMORY WARNING')) {
            this.cache.set(normalized, result);
            this.saveCache();
            return result;
          }
        }
      }
    } catch {
      // Ignore fallback error
    }

    return text;
  }

  /**
   * Translates the entire website into German or restores original English.
   * Walks the DOM tree and replaces text nodes seamlessly.
   */
  public translateWholeWebsite(targetLang: 'de' | 'en') {
    if (typeof window === 'undefined') return;
    this.currentLang = targetLang;

    if (targetLang === 'en') {
      this.revertToOriginal();
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      return;
    }

    // Target is 'de': Run DOM translation
    this.translateDOM();

    // Setup MutationObserver to translate new content dynamically
    if (!this.observer) {
      this.observer = new MutationObserver((mutations) => {
        if (this.currentLang !== 'de' || this.isTranslating) return;
        let hasNewElements = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length > 0) {
            hasNewElements = true;
            break;
          }
        }
        if (hasNewElements) {
          if (this.debounceTimer) clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
            if (this.currentLang === 'de') {
              this.translateDOM();
            }
          }, 100);
        }
      });

      const root = document.getElementById('root') || document.body;
      this.observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: false
      });
    }
  }

  /**
   * Reverts all modified text nodes back to their original English text
   */
  private revertToOriginal() {
    const root = document.getElementById('root') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    while (node) {
      const orig = this.originalNodeValues.get(node);
      if (orig !== undefined) {
        node.nodeValue = orig;
      }
      node = walker.nextNode();
    }
  }

  /**
   * Walks the DOM and translates eligible text nodes
   */
  private translateDOM() {
    if (typeof window === 'undefined') return;
    const root = document.getElementById('root') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName.toUpperCase();
        if (
          tag === 'SCRIPT' ||
          tag === 'STYLE' ||
          tag === 'NOSCRIPT' ||
          tag === 'CODE' ||
          tag === 'PRE' ||
          tag === 'SVG' ||
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          tag === 'OPTION'
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        // Avoid translating dev role badge "DEV" or raw icons
        if (parent.closest('[data-no-translate]') || parent.classList.contains('no-translate')) {
          return NodeFilter.FILTER_REJECT;
        }

        const text = node.nodeValue?.trim();
        if (!text || text.length === 0) return NodeFilter.FILTER_REJECT;
        // Skip pure numbers or prices like €3.50
        if (/^[\d\s€$.,%/:+-]+$/.test(text)) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const pendingNodes: { node: Node; text: string }[] = [];
    let node: Node | null = walker.nextNode();

    while (node) {
      const text = node.nodeValue;
      if (text) {
        const trimmed = text.trim();
        if (trimmed) {
          if (!this.originalNodeValues.has(node)) {
            this.originalNodeValues.set(node, text);
          }

          const cached = this.translateSync(trimmed);
          if (cached) {
            // Apply translation preserving outer whitespace
            const leading = text.match(/^\s*/)?.[0] || '';
            const trailing = text.match(/\s*$/)?.[0] || '';
            node.nodeValue = `${leading}${cached}${trailing}`;
          } else {
            pendingNodes.push({ node, text: trimmed });
          }
        }
      }
      node = walker.nextNode();
    }

    // Translate any un-cached nodes asynchronously
    if (pendingNodes.length > 0) {
      this.translatePendingNodes(pendingNodes.slice(0, 30));
    }
  }

  /**
   * Translates pending text nodes in non-blocking batches
   */
  private async translatePendingNodes(items: { node: Node; text: string }[]) {
    for (const item of items) {
      if (this.currentLang !== 'de') break;
      try {
        const translated = await this.translateText(item.text, 'de');
        if (translated && translated !== item.text && this.currentLang === 'de') {
          const orig = this.originalNodeValues.get(item.node) || item.text;
          const leading = orig.match(/^\s*/)?.[0] || '';
          const trailing = orig.match(/\s*$/)?.[0] || '';
          item.node.nodeValue = `${leading}${translated}${trailing}`;
        }
      } catch {
        // Continue with next
      }
    }
  }
}

export const translationService = new OpenSourceTranslationService();
