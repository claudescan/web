import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Activity, Zap, Users, TrendingUp, Cpu, Copy, Check,
  MessageSquare, RefreshCw
} from 'lucide-react';
import { 
  fetchNetworkStats, fetchTransactions, fetchAgents, fetchBlocks,
  subscribeToTransactions, subscribeToBlocks,
  CCH_TOKEN_ADDRESS
} from '../../services/api';
import type { Transaction, Agent, NetworkStats, Block } from '../../services/api';
import { ClaudeLogo } from '../../components/Navbar/Navbar';
import CONFIG, { LINKS } from '../../config';
import './HomePage.scss';

// ─── Helper Functions ──────────────────────────────────────────────────────

const formatNumber = (num: number): string => {
  if (num === 0) return '—';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

const formatPrice = (price: number): string => {
  if (price === 0) return '$—';
  if (price < 0.00001) return `$${price.toFixed(10)}`;
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
};

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// ─── Components ────────────────────────────────────────────────────────────

const HeroBanner: React.FC<{ stats: NetworkStats | null }> = ({ stats }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONFIG.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasData = stats && stats.price > 0;

  return (
    <div className="hero-banner">
      <div className="hero-content">
        <div className="hero-badge">
          <Cpu size={14} />
          <span>AI-Powered Blockchain</span>
        </div>
        <h1 className="hero-title">
          <span className="gradient-text">Claude Chain</span> Explorer
        </h1>
        <p className="hero-subtitle">
          Track transactions, monitor AI agents, and explore the autonomous economy
        </p>
        
        {/* Price Stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-label">$CCH Price</span>
            <span className="stat-value">{formatPrice(stats?.price || 0)}</span>
            {hasData && stats.priceChange24h !== 0 && (
              <span className={`stat-change ${stats.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                {stats.priceChange24h >= 0 ? '+' : ''}{stats.priceChange24h.toFixed(2)}%
              </span>
            )}
            {!hasData && <span className="stat-pending">Not deployed yet</span>}
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">Market Cap</span>
            <span className="stat-value">{hasData ? `$${formatNumber(stats.marketCap)}` : '$—'}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">Holders</span>
            <span className="stat-value">{hasData ? formatNumber(stats.holders) : '—'}</span>
          </div>
        </div>

        {/* Contract Address */}
        <div className="hero-contract">
          <span className="contract-label">Contract Address:</span>
          <code className="contract-value">{CONFIG.contractAddress}</code>
          <button className="contract-copy" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      
      <div className="hero-visual">
        <ClaudeLogo size={200} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  live?: boolean;
}> = ({ icon, label, value, subValue, change, live }) => (
  <div className={`stat-card ${live ? 'live' : ''}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <span className="stat-label">
        {label}
        {live && <span className="live-dot" />}
      </span>
      <span className="stat-value">{value}</span>
      {subValue && <span className="stat-sub">{subValue}</span>}
      {change !== undefined && change !== 0 && (
        <span className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
        </span>
      )}
    </div>
  </div>
);

const ActionBadge: React.FC<{ 
  label: string; 
  variant: string; 
  extra?: number;
}> = ({ label, variant, extra }) => (
  <div className="action-badge-wrapper">
    <span className={`action-badge ${variant}`}>
      {(variant === 'buy' || variant === 'success') && <span className="dot green" />}
      {(variant === 'sell' || variant === 'danger') && <span className="dot red" />}
      {variant === 'agent' && <Cpu size={12} />}
      {label}
    </span>
    {extra && extra > 0 && (
      <span className="action-badge-counter">+{extra}</span>
    )}
  </div>
);

const TransactionsTable: React.FC<{ 
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
}> = ({ transactions, loading, onRefresh }) => (
  <div className="card transactions-card">
    <div className="card-header">
      <h3 className="card-title">
        <Activity size={18} />
        Latest Transactions
        <span className="live-indicator">
          <span className="pulse" />
          Live
        </span>
      </h3>
      <div className="header-actions">
        <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
        </button>
        <Link to="/transactions" className="btn btn-outline btn-sm">
          View All <ArrowRight size={14} />
        </Link>
      </div>
    </div>
    
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 32 }}></th>
            <th>Signature</th>
            <th>Time</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => (
            <tr key={tx.signature + idx} className="fade-in">
              <td>
                <span className={`status-dot ${tx.status}`} />
              </td>
              <td>
                <Link to={`/tx/${tx.signature}`} className="hash-link mono">
                  {tx.signature.slice(0, 8)}...{tx.signature.slice(-6)}
                </Link>
              </td>
              <td className="time-cell">{formatTimeAgo(tx.blockTime)}</td>
              <td>
                <Link to={`/account/${tx.from}`} className="address-link mono">
                  {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                </Link>
              </td>
              <td>
                <Link to={`/account/${tx.to}`} className="address-link mono">
                  {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                </Link>
              </td>
              <td className="mono">
                {tx.amount > 0 ? formatNumber(tx.amount) : '—'} CCH
              </td>
              <td>
                <ActionBadge 
                  label={tx.action.label} 
                  variant={tx.action.variant}
                  extra={tx.action.extra}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BlocksPanel: React.FC<{ blocks: Block[] }> = ({ blocks }) => (
  <div className="card blocks-card">
    <div className="card-header">
      <h3 className="card-title">
        <TrendingUp size={18} />
        Latest Blocks
        <span className="live-indicator">
          <span className="pulse" />
          Live
        </span>
      </h3>
      <Link to="/blocks" className="btn btn-outline btn-sm">
        View All <ArrowRight size={14} />
      </Link>
    </div>
    
    <div className="blocks-list">
      {blocks.slice(0, 5).map((block, idx) => (
        <Link key={block.slot} to={`/block/${block.slot}`} className="block-row fade-in">
          <div className="block-slot">
            <span className="slot-label">Slot</span>
            <span className="slot-value">{block.slot.toLocaleString()}</span>
          </div>
          <div className="block-info">
            <span className="block-txs">{block.transactions} txns</span>
            <span className="block-time">{formatTimeAgo(block.blockTime)}</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const AgentsPanel: React.FC<{ agents: Agent[] }> = ({ agents }) => (
  <div className="card agents-card">
    <div className="card-header">
      <h3 className="card-title">
        <Cpu size={18} />
        Active AI Agents
      </h3>
      <Link to="/agents" className="btn btn-outline btn-sm">
        View All <ArrowRight size={14} />
      </Link>
    </div>
    
    <div className="agents-list">
      {agents.slice(0, 4).map((agent, idx) => (
        <Link key={idx} to={`/agent/${agent.address}`} className="agent-row">
          <div className="agent-avatar">
            <ClaudeLogo size={36} />
            <span className={`status-indicator ${agent.status}`} />
          </div>
          <div className="agent-info">
            <span className="agent-name">{agent.name}</span>
            <span className="agent-desc">{agent.description}</span>
          </div>
          <div className="agent-stats">
            <div className="agent-stat">
              <MessageSquare size={12} />
              <span>{formatNumber(agent.totalMessages)}</span>
            </div>
            <div className="agent-stat">
              <Activity size={12} />
              <span>{formatNumber(agent.totalTransactions)}</span>
            </div>
          </div>
          <span className={`agent-status ${agent.status}`}>
            {agent.status}
          </span>
        </Link>
      ))}
    </div>

    <div className="card-actions">
      <Link to="/agents/chat" className="btn btn-primary">
        <MessageSquare size={14} /> Chat with Agents
      </Link>
      <Link to="/agents/deploy" className="btn btn-outline">
        <Cpu size={14} /> Deploy Agent
      </Link>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, txData, blocksData, agentsData] = await Promise.all([
        fetchNetworkStats(),
        fetchTransactions({ limit: 10 }),
        fetchBlocks(10),
        fetchAgents(),
      ]);
      
      setStats(statsData);
      setTransactions(txData.transactions);
      setBlocks(blocksData);
      setAgents(agentsData.agents);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const unsubTx = subscribeToTransactions((newTx) => {
      setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
    });

    const unsubBlocks = subscribeToBlocks((newBlock) => {
      setBlocks(prev => [newBlock, ...prev.slice(0, 9)]);
    });

    // Refresh stats every 30 seconds
    const statsInterval = setInterval(async () => {
      const newStats = await fetchNetworkStats();
      setStats(newStats);
    }, 30000);

    return () => {
      unsubTx();
      unsubBlocks();
      clearInterval(statsInterval);
    };
  }, [loadData]);

  const activeAgents = agents.filter(a => a.status === 'active').length;

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Banner */}
        <HeroBanner stats={stats} />

        {/* Stats Row */}
        <div className="stats-row">
          <StatCard 
            icon={<Activity size={20} />}
            label="Transactions"
            value={stats ? formatNumber(stats.transactions) : '—'}
            live
          />
          <StatCard 
            icon={<Zap size={20} />}
            label="TPS"
            value={stats ? stats.tps.toLocaleString() : '—'}
            subValue="Transactions/sec"
            live
          />
          <StatCard 
            icon={<Users size={20} />}
            label="Holders"
            value={stats && stats.holders > 0 ? formatNumber(stats.holders) : '—'}
            change={stats?.priceChange24h}
          />
          <StatCard 
            icon={<Cpu size={20} />}
            label="Active Agents"
            value={activeAgents.toString()}
            subValue={`of ${agents.length} total`}
          />
        </div>

        {/* Main Grid */}
        <div className="main-grid">
          <div className="main-column">
            <TransactionsTable 
              transactions={transactions} 
              loading={refreshing}
              onRefresh={handleRefresh}
            />
          </div>
          <div className="side-column">
            <BlocksPanel blocks={blocks} />
            <AgentsPanel agents={agents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
