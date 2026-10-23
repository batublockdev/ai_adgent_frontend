import { Pool } from 'pg';
import { createPublicClient, http, formatUnits, parseAbi } from 'viem';
import { celo } from 'viem/chains';

// ============ POSTGRES ============

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway')
    ? { rejectUnauthorized: false }
    : undefined,
  max: 3,
});

// ============ CELO CLIENT ============

const publicClient = createPublicClient({
  chain: celo,
  transport: http('https://forno.celo.org'),
});

const ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]);

// ============ CONFIG ============

const INVESTMENT_AGENT_MINIMAL_ACCOUNT = '0x74E16132B76Af0B03730F5c4BF540D777b085DDc';
const STOCKWALLET_ADDRESS = '0x573a678Ea7a51B51344fe6a1781BBCCbF0E453C7';

const TOKENS: Record<string, { address: `0x${string}`; decimals: number }> = {
  USDC: { address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', decimals: 6 },
  USDT: { address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e', decimals: 6 },
  WBTC: { address: '0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D', decimals: 8 },
  WETH: { address: '0xD221812de1BD094f35587EE8E174B07B6167D9Af', decimals: 18 },
  wBRL: { address: '0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0', decimals: 18 },
  CELO: { address: '0x471EcE3750Da237f93B8E339c536989b8978a438', decimals: 18 },
  EURm: { address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73', decimals: 6 },
  CHFm: { address: '0xb55a79F398E759E43C95b979163f30eC87Ee131D', decimals: 6 },
  GBPm: { address: '0xCCF663b1fF11028f0b19058d0f7B674004a40746', decimals: 6 },
};

// ============ QUERIES ============

export async function getInvestmentAgentData() {
  const client = await pool.connect();
  try {
    const [trades, decisions, performance, knowledge] = await Promise.all([
      client.query('SELECT * FROM trades ORDER BY timestamp DESC LIMIT 50'),
      client.query('SELECT * FROM decisions ORDER BY timestamp DESC LIMIT 50'),
      client.query('SELECT * FROM performance ORDER BY timestamp DESC LIMIT 1'),
      client.query("SELECT category, key, value FROM knowledge WHERE category = 'market' ORDER BY key"),
    ]);

    return {
      trades: trades.rows,
      decisions: decisions.rows,
      performance: performance.rows[0] || null,
      knowledge: knowledge.rows,
    };
  } finally {
    client.release();
  }
}

export async function getStockWalletData() {
  const client = await pool.connect();
  try {
    const [state, activity] = await Promise.all([
      client.query("SELECT * FROM bot_state WHERE key = 'singleton'"),
      client.query('SELECT * FROM stockwallet_activity ORDER BY timestamp DESC LIMIT 50'),
    ]);

    return {
      botState: state.rows[0] || null,
      activity: activity.rows,
    };
  } finally {
    client.release();
  }
}

export async function getOnChainBalances(address: string) {
  const balances: { token: string; balance: string; address: string }[] = [];

  for (const [symbol, info] of Object.entries(TOKENS)) {
    try {
      const balance = await publicClient.readContract({
        address: info.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      } as any);
      const formatted = formatUnits(balance as bigint, info.decimals);
      if (parseFloat(formatted) > 0) {
        balances.push({ token: symbol, balance: formatted, address: info.address });
      }
    } catch {
      // skip
    }
  }

  // Native CELO
  try {
    const balance = await publicClient.getBalance({ address: address as `0x${string}` } as any);
    const formatted = formatUnits(balance, 18);
    if (parseFloat(formatted) > 0) {
      balances.push({ token: 'CELO (native)', balance: formatted, address: 'native' });
    }
  } catch {
    // skip
  }

  return balances;
}

export async function getAllData() {
  const [investment, stockwallet, investmentBalances, stockwalletBalances] = await Promise.all([
    getInvestmentAgentData(),
    getStockWalletData(),
    getOnChainBalances(INVESTMENT_AGENT_MINIMAL_ACCOUNT),
    getOnChainBalances(STOCKWALLET_ADDRESS),
  ]);

  return {
    investment,
    stockwallet,
    investmentBalances,
    stockwalletBalances,
  };
}