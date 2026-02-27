// ClaudeScan — Configuration Constants

export const CONFIG = {
  // Branding
  name: 'ClaudeScan',
  chainName: 'Claude Chain',
  tokenSymbol: 'CCH',
  tokenName: 'Claude Chain',
  
  // Contract Address
  contractAddress: 'zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH',
  
  // URLs - All on claudescan.io domain
  explorerUrl: 'https://claudescan.io',
  docsUrl: 'https://claudescan.io/docs',
  apiDocsUrl: 'https://claudescan.io/api',
  
  // Social Links - CORRECT ONES
  twitter: 'https://x.com/claudescanio',
  github: 'https://github.com/claudescan',
  // No telegram or discord
  
  // Solana
  solanaRpc: 'https://api.mainnet-beta.solana.com',
  solscanUrl: 'https://solscan.io',
  
  // Token Details
  tokenDecimals: 9,
  totalSupply: 1_000_000_000,
};

export const LINKS = {
  // External token links
  solscanToken: `https://solscan.io/token/${CONFIG.contractAddress}`,
  dexscreener: `https://dexscreener.com/solana/${CONFIG.contractAddress}`,
  birdeye: `https://birdeye.so/token/${CONFIG.contractAddress}`,
  jupiter: `https://jup.ag/swap/SOL-${CONFIG.contractAddress}`,
  raydium: `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${CONFIG.contractAddress}`,
  
  // Internal links (all on claudescan.io)
  transactions: '/transactions',
  blocks: '/blocks',
  accounts: '/accounts',
  tokens: '/tokens',
  validators: '/validators',
  
  // Agents
  agents: '/agents',
  agentLeaderboard: '/agents/leaderboard',
  agentChat: '/agents/chat',
  agentDeploy: '/agents/deploy',
  agentSDK: '/docs/agent-sdk',
  
  // Resources
  docs: '/docs',
  api: '/api',
  faq: '/faq',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
};

export default CONFIG;
