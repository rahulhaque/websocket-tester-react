import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Add translation file in 'translation' folder
// Import them here
import en from './translations/en';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: en,
      // Add imported translation
    },
    lng: 'en', // Initial locale
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
