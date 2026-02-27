import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, ArrowRight, Activity, Zap, Users, TrendingUp,
  BarChart3, LineChart, Settings, Cpu, MessageSquare, Copy, Check
} from 'lucide-react';
import { 
  fetchNetworkStats, fetchTransactions, fetchAgents, fetchCCHPrice,
  CCH_TOKEN_ADDRESS
} from '../../services/api';
import type { Transaction, Agent, NetworkStats, PriceData } from '../../services/api';
import { ClaudeLogo } from '../../components/Navbar/Navbar';
import CONFIG from '../../config';
import './HomePage.scss';

// ─── Components ────────────────────────────────────────────────────────────

const HeroBanner: React.FC<{ price: PriceData | null }> = ({ price }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONFIG.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        {price && (
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-label">$CCH Price</span>
              <span className="stat-value">${price.price.toFixed(4)}</span>
              <span className={`stat-change ${price.change24h >= 0 ? 'positive' : 'negative'}`}>
                {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
              </span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-label">Market Cap</span>
              <span className="stat-value">${formatNumber(price.marketCap)}</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-label">24h Volume</span>
              <span className="stat-value">${formatNumber(price.volume24h)}</span>
            </div>
          </div>
        )}

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
}> = ({ icon, label, value, subValue, change }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {subValue && <span className="stat-sub">{subValue}</span>}
      {change !== undefined && (
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

const TransactionsTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
  <div className="card transactions-card">
    <div className="card-header">
      <h3 className="card-title">
        <Activity size={18} />
        Latest Transactions
      </h3>
      <Link to="/transactions" className="btn btn-outline btn-sm">
        View All <ArrowRight size={14} />
      </Link>
    </div>
    
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
          <tr key={idx}>
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
      {agents.slice(0, 5).map((agent, idx) => (
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

    <Link to="/agents" className="view-all-link">
      VIEW ALL AGENTS <ArrowRight size={14} />
    </Link>
  </div>
);

const NetworkChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D' | '30D'>('24H');

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h3 className="card-title">
          <TrendingUp size={18} />
          Network Activity
        </h3>
        <div className="chart-controls">
          <div className="toggle-group">
            {(['1H', '24H', '7D', '30D'] as const).map(range => (
              <button 
                key={range}
                className={`toggle-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >{range}</button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="chart-body">
        <div className="chart-y-axis">
          <span>5K</span>
          <span>4K</span>
          <span>3K</span>
          <span>2K</span>
          <span>1K</span>
          <span>0</span>
        </div>
        <div className="chart-area">
          <svg viewBox="0 0 400 200" className="chart-svg">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,180 L30,160 L60,170 L90,140 L120,150 L150,100 L180,120 L210,80 L240,90 L270,60 L300,70 L330,40 L360,50 L400,30"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2"
            />
            <path
              d="M0,180 L30,160 L60,170 L90,140 L120,150 L150,100 L180,120 L210,80 L240,90 L270,60 L300,70 L330,40 L360,50 L400,30 L400,200 L0,200 Z"
              fill="url(#chartGradient)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// ─── Main Component ────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [price, setPrice] = useState<PriceData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, priceData, txData, agentsData] = await Promise.all([
          fetchNetworkStats(),
          fetchCCHPrice(),
          fetchTransactions({ limit: 10 }),
          fetchAgents(),
        ]);
        
        setStats(statsData);
        setPrice(priceData);
        setTransactions(txData.transactions);
        setAgents(agentsData.agents);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Banner */}
        <HeroBanner price={price} />

        {/* Stats Row */}
        <div className="stats-row">
          <StatCard 
            icon={<Activity size={20} />}
            label="Transactions"
            value={stats ? formatNumber(stats.transactions) : '—'}
            change={12.5}
          />
          <StatCard 
            icon={<Zap size={20} />}
            label="TPS"
            value={stats ? stats.tps.toLocaleString() : '—'}
            subValue="Transactions/sec"
          />
          <StatCard 
            icon={<Users size={20} />}
            label="Holders"
            value={stats ? formatNumber(stats.holders) : '—'}
            change={8.3}
          />
          <StatCard 
            icon={<Cpu size={20} />}
            label="Active Agents"
            value={agents.filter(a => a.status === 'active').length.toString()}
            subValue={`of ${agents.length} total`}
          />
        </div>

        {/* Main Grid */}
        <div className="main-grid">
          <TransactionsTable transactions={transactions} />
          <div className="side-column">
            <NetworkChart />
            <AgentsPanel agents={agents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
