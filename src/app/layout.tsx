import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader, SiteFooter } from '@/components/chrome';
export const metadata: Metadata = { title:'Schrute Security — Cybersecurity Department', description:'Think like a hacker. Defend like an expert.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><SiteHeader/>{children}<SiteFooter/></body></html>; }
