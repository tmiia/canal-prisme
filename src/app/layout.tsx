import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navBar";
import LocalFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const canalBoldItalic = LocalFont({
  src: '../../public/fonts/canalbolditalique-webfont.ttf',
  variable: '--font-canal-bold-italic',
});

const canalDemiRomain = LocalFont({
  src: '../../public/fonts/canaldemiromain-webfont.ttf',
  variable: '--font-canal-demi-romain',
});

const canalLightItalic = LocalFont({
  src: '../../public/fonts/canallightitalique-webfont.ttf',
  variable: '--font-canal-light-italic',
});

const canalLightRomain = LocalFont({
  src: '../../public/fonts/canallightromain-webfont.ttf',
  variable: '--font-canal-light-romain',
});

export const metadata: Metadata = {
  title: 'Canal+1 | D&AD Newblood',
  description: "CANAL+1 is streaming’s new lab shaping the future of storytelling. Directors, photographers, musicians and designers get free rein to extend CANAL+ Originals through their own lens.",
  icons: {
    icon: '/favicon-32x32.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${canalBoldItalic.variable} ${canalDemiRomain.variable} ${canalLightItalic.variable} ${canalLightRomain.variable}`}
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}