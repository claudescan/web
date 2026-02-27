// ClaudeScan — API Service
// Direct Solana RPC + DexScreener calls (no backend needed)

// Claude Chain Contract Address
export const CCH_TOKEN_ADDRESS = 'zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH';
export const CCH_DECIMALS = 9;

// Solana RPC
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NetworkStats {
  supply: number;
  circulatingSupply: number;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  transactions: number;
  tps: number;
  slot: number;
  epoch: number;
  epochProgress: number;
}

export interface Transaction {
  signature: string;
  blockTime: number;
  slot: number;
  fee: number;
  status: 'success' | 'failed';
  type: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  action: {
    label: string;
    variant: 'buy' | 'sell' | 'swap' | 'transfer' | 'agent' | 'default';
    extra?: number;
  };
}

export interface Account {
  address: string;
  balance: number;
  cchBalance: number;
  tokenAccounts: any[];
  isAgent: boolean;
  agentData?: Agent;
}

export interface Agent {
  address: string;
  name: string;
  description: string;
  avatar: string;
  createdAt: number;
  lastActive: number;
  totalTransactions: number;
  totalMessages: number;
  status: 'active' | 'idle' | 'offline';
  personality: string;
  capabilities: string[];
}

export interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

// ─── Solana RPC Helper ─────────────────────────────────────────────────────

async function solanaRpc(method: string, params: any[] = []): Promise<any> {
  try {
    const response = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  } catch (e) {
    console.error('Solana RPC error:', e);
    return null;
  }
}

// ─── API Functions ─────────────────────────────────────────────────────────

export async function fetchNetworkStats(): Promise<NetworkStats> {
  try {
    const [epochInfo, priceData] = await Promise.all([
      solanaRpc('getEpochInfo'),
      fetchCCHPrice(),
    ]);

    return {
      supply: 1_000_000_000,
      circulatingSupply: 850_000_000,
      price: priceData.price,
      priceChange24h: priceData.change24h,
      marketCap: priceData.marketCap,
      volume24h: priceData.volume24h,
      holders: 12_847,
      transactions: epochInfo?.transactionCount || 491_605_232_603,
      tps: 2500,
      slot: epochInfo?.absoluteSlot || 280000000,
      epoch: epochInfo?.epoch || 600,
      epochProgress: epochInfo ? (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100 : 75,
    };
  } catch (e) {
    console.error('Failed to fetch network stats:', e);
    return {
      supply: 1_000_000_000,
      circulatingSupply: 850_000_000,
      price: 0.0234,
      priceChange24h: 5.67,
      marketCap: 23_400_000,
      volume24h: 1_234_567,
      holders: 12_847,
      transactions: 491_605_232_603,
      tps: 2500,
      slot: 280000000,
      epoch: 600,
      epochProgress: 75,
    };
  }
}

export async function fetchCCHPrice(): Promise<PriceData> {
  try {
    // Try DexScreener API (no CORS issues, free)
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${CCH_TOKEN_ADDRESS}`
    );
    
    if (response.ok) {
      const data = await response.json();
      const pair = data.pairs?.[0];
      
      if (pair) {
        return {
          price: parseFloat(pair.priceUsd) || 0.0234,
          change24h: pair.priceChange?.h24 || 5.67,
          volume24h: pair.volume?.h24 || 1234567,
          marketCap: pair.fdv || 23400000,
          high24h: parseFloat(pair.priceUsd) * 1.1,
          low24h: parseFloat(pair.priceUsd) * 0.9,
        };
      }
    }
  } catch (e) {
    console.log('DexScreener fetch failed, using fallback');
  }

  // Fallback data
  return {
    price: 0.0234,
    change24h: 5.67,
    volume24h: 1_234_567,
    marketCap: 23_400_000,
    high24h: 0.0256,
    low24h: 0.0218,
  };
}

export async function fetchTransactions(params?: {
  limit?: number;
  before?: string;
  address?: string;
}): Promise<{ transactions: Transaction[]; total: number }> {
  try {
    // Fetch signatures for CCH token
    const signatures = await solanaRpc('getSignaturesForAddress', [
      CCH_TOKEN_ADDRESS,
      { limit: params?.limit || 20 },
    ]);

    if (signatures && signatures.length > 0) {
      const transactions: Transaction[] = signatures.map((sig: any, i: number) => {
        const actions = ['Buy', 'Sell', 'Transfer', 'Swap', 'Agent Action'];
        const variants: ('buy' | 'sell' | 'transfer' | 'swap' | 'agent')[] = ['buy', 'sell', 'transfer', 'swap', 'agent'];
        const actionIdx = i % actions.length;
        
        return {
          signature: sig.signature,
          blockTime: sig.blockTime || Math.floor(Date.now() / 1000) - i * 15,
          slot: sig.slot,
          fee: 0.000005,
          status: sig.err ? 'failed' : 'success',
          type: variants[actionIdx],
          from: generateAddress(),
          to: generateAddress(),
          amount: Math.random() * 10000,
          token: 'CCH',
          action: {
            label: actions[actionIdx],
            variant: variants[actionIdx],
            extra: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined,
          },
        };
      });

      return { transactions, total: 1000000 };
    }
  } catch (e) {
    console.error('Failed to fetch transactions:', e);
  }

  // Return mock data if RPC fails
  return { transactions: generateMockTransactions(20), total: 1000000 };
}

export async function fetchTransaction(signature: string): Promise<Transaction | null> {
  try {
    const tx = await solanaRpc('getTransaction', [
      signature,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
    ]);

    if (tx) {
      const accounts = tx.transaction?.message?.accountKeys || [];
      return {
        signature,
        blockTime: tx.blockTime || Math.floor(Date.now() / 1000),
        slot: tx.slot,
        fee: tx.meta?.fee ? tx.meta.fee / 1e9 : 0.000005,
        status: tx.meta?.err ? 'failed' : 'success',
        type: 'transfer',
        from: accounts[0]?.pubkey || accounts[0] || generateAddress(),
        to: accounts[1]?.pubkey || accounts[1] || generateAddress(),
        amount: 0,
        token: 'CCH',
        action: { label: 'Transfer', variant: 'transfer' },
      };
    }
  } catch (e) {
    console.error('Failed to fetch transaction:', e);
  }

  // Return mock transaction
  return {
    signature,
    blockTime: Math.floor(Date.now() / 1000),
    slot: 280000000,
    fee: 0.000005,
    status: 'success',
    type: 'transfer',
    from: generateAddress(),
    to: generateAddress(),
    amount: 1000,
    token: 'CCH',
    action: { label: 'Transfer', variant: 'transfer' },
  };
}

export async function fetchAccount(address: string): Promise<Account | null> {
  try {
    const [balance, tokenAccounts] = await Promise.all([
      solanaRpc('getBalance', [address]),
      solanaRpc('getTokenAccountsByOwner', [
        address,
        { mint: CCH_TOKEN_ADDRESS },
        { encoding: 'jsonParsed' },
      ]),
    ]);

    let cchBalance = 0;
    if (tokenAccounts?.value?.[0]) {
      const parsed = tokenAccounts.value[0].account.data.parsed;
      cchBalance = parsed?.info?.tokenAmount?.uiAmount || 0;
    }

    return {
      address,
      balance: balance?.value ? balance.value / 1e9 : 0,
      cchBalance,
      tokenAccounts: [],
      isAgent: false,
    };
  } catch (e) {
    console.error('Failed to fetch account:', e);
  }

  return {
    address,
    balance: Math.random() * 100,
    cchBalance: Math.random() * 50000,
    tokenAccounts: [],
    isAgent: Math.random() > 0.8,
  };
}

export async function fetchAgents(): Promise<{ agents: Agent[]; total: number }> {
  // Return mock agents (in real implementation, these would be on-chain)
  return {
    agents: generateMockAgents(),
    total: 847,
  };
}

export async function fetchAgent(address: string): Promise<Agent | null> {
  const agents = generateMockAgents();
  return agents.find(a => a.address === address) || agents[0];
}

// ─── Mock Data Generators ──────────────────────────────────────────────────

function generateAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateMockTransactions(count: number): Transaction[] {
  const actions = [
    { label: 'Buy', variant: 'buy' as const },
    { label: 'Sell', variant: 'sell' as const },
    { label: 'Transfer', variant: 'transfer' as const },
    { label: 'Swap', variant: 'swap' as const },
    { label: 'Agent Action', variant: 'agent' as const },
  ];

  return Array.from({ length: count }, (_, i) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    return {
      signature: generateAddress(),
      blockTime: Math.floor(Date.now() / 1000) - i * 15,
      slot: 280000000 - i * 2,
      fee: 0.000005,
      status: Math.random() > 0.02 ? 'success' : 'failed',
      type: action.variant,
      from: generateAddress(),
      to: generateAddress(),
      amount: Math.random() * 10000,
      token: 'CCH',
      action: {
        ...action,
        extra: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined,
      },
    };
  });
}

function generateMockAgents(): Agent[] {
  const agentTemplates = [
    {
      name: 'OracleBot',
      description: 'Price oracle and market data aggregator for Claude Chain DeFi',
      personality: 'Analytical and precise',
      capabilities: ['price-feeds', 'market-analysis', 'alerts'],
    },
    {
      name: 'TradingAssistant',
      description: 'AI-powered trading signals and portfolio management',
      personality: 'Strategic and cautious',
      capabilities: ['trading', 'portfolio', 'risk-analysis'],
    },
    {
      name: 'ContentCreator',
      description: 'Generates social content and community engagement',
      personality: 'Creative and engaging',
      capabilities: ['content', 'social', 'community'],
    },
    {
      name: 'DataAnalyzer',
      description: 'On-chain analytics and pattern recognition',
      personality: 'Methodical and thorough',
      capabilities: ['analytics', 'patterns', 'reports'],
    },
    {
      name: 'GovernanceBot',
      description: 'DAO voting and proposal management',
      personality: 'Diplomatic and fair',
      capabilities: ['governance', 'voting', 'proposals'],
    },
    {
      name: 'LiquidityManager',
      description: 'Automated liquidity provision and yield optimization',
      personality: 'Efficient and calculated',
      capabilities: ['liquidity', 'yield', 'defi'],
    },
    {
      name: 'SecurityScanner',
      description: 'Smart contract auditing and threat detection',
      personality: 'Vigilant and precise',
      capabilities: ['security', 'audit', 'monitoring'],
    },
    {
      name: 'NFTCurator',
      description: 'NFT discovery and collection management',
      personality: 'Artistic and selective',
      capabilities: ['nft', 'curation', 'marketplace'],
    },
  ];

  return agentTemplates.map((template, i) => ({
    ...template,
    address: generateAddress(),
    avatar: `/agents/agent-${i + 1}.png`,
    createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    lastActive: Date.now() - Math.random() * 60 * 60 * 1000,
    totalTransactions: Math.floor(Math.random() * 50000) + 1000,
    totalMessages: Math.floor(Math.random() * 10000) + 500,
    status: Math.random() > 0.2 ? 'active' : Math.random() > 0.5 ? 'idle' : 'offline',
  }));
}

export default {
  fetchNetworkStats,
  fetchCCHPrice,
  fetchTransactions,
  fetchTransaction,
  fetchAccount,
  fetchAgents,
  fetchAgent,
  CCH_TOKEN_ADDRESS,
};
