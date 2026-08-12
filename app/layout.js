import { DM_Sans } from 'next/font/google';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import './globals.css';

/* DM Sans — heading & numeral font, loaded via next/font for
   automatic subset optimisation and zero layout shift.
   Variable exported as --font-dm-sans, wired into --font-heading
   in design-system/tokens/_typography.css via layout className. */
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

/* Elms Sans — body/UI font, self-hosted from /elms-sans/.
   @font-face declarations live in design-system/fonts/_font-face.css.
   No CDN link needed. */

export const metadata = {
  title: 'DCAA form submission',
  description: 'DCAA form submission dashboard',
  icons: {
    icon: '/pictures/dcaa-logo-transparent.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{
          // Wire next/font's generated CSS variable into the
          // design system's --font-heading token at runtime.
          ['--font-heading']: 'var(--font-dm-sans), "DM Sans", system-ui, sans-serif',
        }}
      >
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
