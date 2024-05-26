'use client';
import { createContext, useContext } from 'react';
import { Inter, Hanken_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const hg = Hanken_Grotesk({ subsets: ['latin'] });

export const FontContext = createContext({
  primaryFont: null,
  secondaryFont: null,
});

export const useFont = () => useContext(FontContext);

export const FontProvider = ({ children }) => {
  return (
    <FontContext.Provider value={{ primaryFont: hg, secondaryFont: inter }}>
      <main className={inter.className}>{children}</main>
    </FontContext.Provider>
  );
};
