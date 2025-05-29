import './globals.css';
import SessionClientProvider from './SessionClientProvider';
import ProfileBar from './profile-bar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionClientProvider>
          <ProfileBar />
          {children}
        </SessionClientProvider>
      </body>
    </html>
  );
}
