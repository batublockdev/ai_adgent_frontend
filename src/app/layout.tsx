export const metadata = {
  title: 'Agents Dashboard',
  description: 'Celo Investment Agent & StockWallet Bot monitor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f5f5f5' }}>{children}</body>
    </html>
  );
}