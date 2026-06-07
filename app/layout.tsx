import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trenes',
  description: 'Consulta de viajes de trenes SOFSE',
  icons: {
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
    apple: '/icon.jpg'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
