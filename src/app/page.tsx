import { getAllData } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const data = await getAllData();

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>🤖 Agents Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 32, fontSize: 14 }}>
        Celo mainnet · Updated {new Date().toLocaleString()}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Investment Agent */}
        <section style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 20, background: '#fafafa' }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>📈 Celo Investment Agent</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            MinimalAccount: 0x74E1...5DDc
          </p>

          <h3 style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>Balances</h3>
          <TokenBalances balances={data.investmentBalances} />

          <h3 style={{ fontSize: 14, color: '#555', marginTop: 20, marginBottom: 8 }}>Performance</h3>
          <PerformanceCard performance={data.investment.performance} />

          <h3 style={{ fontSize: 14, color: '#555', marginTop: 20, marginBottom: 8 }}>Recent Decisions</h3>
          <DecisionsTable decisions={data.investment.decisions} />

          <h3 style={{ fontSize: 14, color: '#555', marginTop: 20, marginBottom: 8 }}>Recent Trades</h3>
          <TradesTable trades={data.investment.trades} />
        </section>

        {/* StockWallet Bot */}
        <section style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 20, background: '#fafafa' }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>🛡️ StockWallet Bot</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            Contract: 0x573a...53C7
          </p>

          <h3 style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>Balances</h3>
          <TokenBalances balances={data.stockwalletBalances} />

          <h3 style={{ fontSize: 14, color: '#555', marginTop: 20, marginBottom: 8 }}>Bot State</h3>
          <BotStateCard state={data.stockwallet.botState} />

          <h3 style={{ fontSize: 14, color: '#555', marginTop: 20, marginBottom: 8 }}>Recent Activity</h3>
          <ActivityTable activity={data.stockwallet.activity} />
        </section>
      </div>

      <footer style={{ marginTop: 40, textAlign: 'center', color: '#aaa', fontSize: 12 }}>
        Powered by Celo · PostgreSQL · Railway
      </footer>
    </main>
  );
}

function TokenBalances({ balances }: { balances: { token: string; balance: string; address: string }[] }) {
  if (!balances || balances.length === 0) {
    return <p style={{ color: '#999', fontSize: 13 }}>No balances</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {balances.map((b) => (
        <div key={b.token + b.address} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{b.token}</span>
          <span style={{ fontSize: 14, fontFamily: 'monospace' }}>{parseFloat(b.balance).toFixed(6)}</span>
        </div>
      ))}
    </div>
  );
}

function PerformanceCard({ performance }: { performance: any }) {
  if (!performance) return <p style={{ color: '#999', fontSize: 13 }}>No data</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
      <div><strong>Total Value:</strong> ${performance.total_value || '0'}</div>
      <div><strong>P&L:</strong> {performance.total_pnl || '0'}</div>
      <div><strong>Win Rate:</strong> {performance.win_rate || '0'}%</div>
      <div><strong>Trades:</strong> {performance.trade_count || 0}</div>
    </div>
  );
}

function DecisionsTable({ decisions }: { decisions: any[] }) {
  if (!decisions || decisions.length === 0) {
    return <p style={{ color: '#999', fontSize: 13 }}>No decisions yet</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto' }}>
      {decisions.map((d) => (
        <div key={d.id} style={{ padding: '8px', background: 'white', borderRadius: 6, border: '1px solid #eee', fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: actionColor(d.action) }}>
              {d.action.toUpperCase()} {d.asset ? d.asset : ''} {d.amount ? d.amount : ''}
            </span>
            <span style={{ color: '#888' }}>{new Date(Number(d.timestamp)).toLocaleString()}</span>
          </div>
          <div style={{ color: '#666' }}>{d.reason}</div>
          <div style={{ color: '#aaa', marginTop: 2 }}>Confidence: {d.confidence}% · Level: {d.level}</div>
        </div>
      ))}
    </div>
  );
}

function TradesTable({ trades }: { trades: any[] }) {
  if (!trades || trades.length === 0) {
    return <p style={{ color: '#999', fontSize: 13 }}>No trades yet</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto' }}>
      {trades.map((t) => (
        <div key={t.id} style={{ padding: '8px', background: 'white', borderRadius: 6, border: '1px solid #eee', fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: actionColor(t.action) }}>
              {t.action.toUpperCase()} {t.asset ? t.asset : ''} {t.amount ? t.amount : ''}
            </span>
            <span style={{ color: '#888' }}>{new Date(Number(t.timestamp)).toLocaleString()}</span>
          </div>
          {t.tx_hash && (
            <div style={{ color: '#4a90d9', fontSize: 11 }}>
              TX: {t.tx_hash.slice(0, 18)}...
            </div>
          )}
          {t.reason && <div style={{ color: '#666', marginTop: 2 }}>{t.reason}</div>}
        </div>
      ))}
    </div>
  );
}

function BotStateCard({ state }: { state: any }) {
  if (!state) return <p style={{ color: '#999', fontSize: 13 }}>No state data</p>;
  const isPaused = Number(state.pause_until) > Math.floor(Date.now() / 1000);
  const pauseEnds = state.pause_until > 0
    ? new Date(Number(state.pause_until) * 1000).toLocaleString()
    : 'Not paused';
  const eventCount = Array.isArray(state.processed_events) ? state.processed_events.length : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
      <div><strong>Last Block:</strong> {state.last_processed_block}</div>
      <div><strong>Status:</strong> {isPaused ? '🟡 Paused' : '🟢 Active'}</div>
      <div><strong>Pause Until:</strong> {pauseEnds}</div>
      <div><strong>Processed Events:</strong> {eventCount}</div>
      <div><strong>Last Updated:</strong> {state.updated_at ? new Date(Number(state.updated_at)).toLocaleString() : 'N/A'}</div>
    </div>
  );
}

function actionColor(action: string): string {
  switch (action) {
    case 'hold': case 'HOLD': case 'SKIP': return '#888';
    case 'swap': return '#4a90d9';
    case 'buy': case 'INVEST': return '#27ae60';
    case 'sell': case 'SELL_ALL': case 'SELL_PROFIT': return '#e74c3c';
    case 'supply': return '#8e44ad';
    case 'borrow': return '#f39c12';
    case 'repay': return '#16a085';
    case 'withdraw': return '#e67e22';
    case 'swap_and_supply': return '#9b59b6';
    case 'PAUSE': return '#f39c12';
    default: return '#333';
  }
}

function ActivityTable({ activity }: { activity: any[] }) {
  if (!activity || activity.length === 0) {
    return <p style={{ color: '#999', fontSize: 13 }}>No activity yet</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto' }}>
      {activity.map((a) => (
        <div key={a.id} style={{ padding: '8px', background: 'white', borderRadius: 6, border: '1px solid #eee', fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: actionColor(a.action) }}>
              {a.action} {a.asset_symbol ? a.asset_symbol : ''}
            </span>
            <span style={{ color: '#888' }}>{new Date(Number(a.timestamp)).toLocaleString()}</span>
          </div>
          {a.balance && <div style={{ color: '#666' }}>Balance: {a.balance}</div>}
          {a.estimated_value && <div style={{ color: '#666' }}>Est. value: {a.estimated_value}</div>}
          {a.invested && <div style={{ color: '#666' }}>Invested: {a.invested}</div>}
          {a.reason && <div style={{ color: '#666' }}>{a.reason}</div>}
          {a.tx_hash && <div style={{ color: '#4a90d9', fontSize: 11 }}>TX: {a.tx_hash.slice(0, 18)}...</div>}
        </div>
      ))}
    </div>
  );
}