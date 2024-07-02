import React, { useState } from 'react';
import './language_picker.css';

const LanguagePicker = ({ languageCode, setLanguageCode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ge', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const handleLanguageChange = (langCode) => {
    setLanguageCode(langCode);
    setIsOpen(false);
  };

  const getCurrentLanguageFlag = () => {
    const currentLang = languages.find((lang) => lang.code === languageCode);
    return currentLang ? currentLang.flag : '🌐';
  };

  const getCurrentLanguageName = () => {
    const currentLang = languages.find((lang) => lang.code === languageCode);
    return currentLang ? currentLang.name : 'English';
  };

  return (
    <div className="language-picker">
      <button className="language-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="flag">{getCurrentLanguageFlag()}</span>
        <span className="language-name">{getCurrentLanguageName()}</span>
        <span className="arrow">▼</span>
      </button>
      {isOpen && (
        <ul className="language-dropdown">
          {languages.map((lang) => (
            <li key={lang.code}>
              <button className="language-button" onClick={() => handleLanguageChange(lang.code)}>
                <span className="flag">{lang.flag}</span>
                <span className="language-name">{lang.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguagePicker;
