// ClaudeScan — Configuration Constants

export const CONFIG = {
  // Branding
  name: 'ClaudeScan',
  chainName: 'Claude Chain',
  tokenSymbol: 'CCH',
  tokenName: 'Claude Chain',
  
  // Contract Address - IMPORTANT: Display this prominently
  contractAddress: 'zvDFbTf9wf4paJrKZs7pJ3xbvWW9QcXdsspSXthdCCH',
  
  // URLs
  explorerUrl: 'https://claudescan.io',
  websiteUrl: 'https://claudechain.ai',
  docsUrl: 'https://docs.claudechain.ai',
  
  // Social Links
  twitter: 'https://twitter.com/ClaudeChain',
  telegram: 'https://t.me/ClaudeChain',
  discord: 'https://discord.gg/claudechain',
  github: 'https://github.com/claudechain',
  
  // Solana
  solanaRpc: 'https://api.mainnet-beta.solana.com',
  solscanUrl: 'https://solscan.io',
  
  // Token Details
  tokenDecimals: 9,
  totalSupply: 1_000_000_000,
  
  // Features
  enableAgents: true,
  enableChat: true,
  enableAnalytics: true,
};

export const LINKS = {
  solscanToken: `https://solscan.io/token/${CONFIG.contractAddress}`,
  dexscreener: `https://dexscreener.com/solana/${CONFIG.contractAddress}`,
  birdeye: `https://birdeye.so/token/${CONFIG.contractAddress}`,
  jupiter: `https://jup.ag/swap/SOL-${CONFIG.contractAddress}`,
  raydium: `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${CONFIG.contractAddress}`,
};

export default CONFIG;
