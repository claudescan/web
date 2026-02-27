// ClaudeScan — Page Components
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink, Activity, Cpu, Users, Clock, MessageSquare } from 'lucide-react';
import { 
  fetchTransactions, fetchTransaction, fetchAccount, fetchAgents, fetchAgent,
  CCH_TOKEN_ADDRESS
} from './services/api';
import type { Transaction, Account, Agent } from './services/api';
import { ClaudeLogo } from './components/Navbar/Navbar';
import CONFIG, { LINKS } from './config';
import './pages/Pages.scss';

// ─── Transactions Page ─────────────────────────────────────────────────────

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTransactions({ limit: 50 });
      setTransactions(data.transactions);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Latest $CCH transactions on Claude Chain</p>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Signature</th>
                <th>Block</th>
                <th>Time</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr key={idx}>
                  <td>
                    <Link to={`/tx/${tx.signature}`} className="hash-link mono">
                      {tx.signature.slice(0, 12)}...
                    </Link>
                  </td>
                  <td className="mono">{tx.slot.toLocaleString()}</td>
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
                  <td className="mono">{tx.amount > 0 ? formatNumber(tx.amount) : '—'} CCH</td>
                  <td>
                    <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Transaction Detail ────────────────────────────────────────────────────

export const TransactionDetail: React.FC = () => {
  const { signature } = useParams<{ signature: string }>();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (signature) {
      fetchTransaction(signature).then(setTx);
    }
  }, [signature]);

  const handleCopy = () => {
    navigator.clipboard.writeText(signature || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page">
      <div className="container">
        <Link to="/transactions" className="back-link">
          <ArrowLeft size={16} /> Back to Transactions
        </Link>

        <div className="page-header">
          <h1 className="page-title">Transaction Details</h1>
          {tx && (
            <span className={`status-badge ${tx.status}`}>{tx.status}</span>
          )}
        </div>

        <div className="signature-card">
          <span className="label">Signature</span>
          <code className="value">{signature}</code>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <a 
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="external-btn"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Overview</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Status</span>
              <span className="value">
                <span className={`status-badge ${tx?.status || 'success'}`}>
                  {tx?.status || 'Success'}
                </span>
              </span>
            </div>
            <div className="info-row">
              <span className="label">Block</span>
              <span className="value mono">{tx?.slot?.toLocaleString() || '—'}</span>
            </div>
            <div className="info-row">
              <span className="label">Timestamp</span>
              <span className="value">{tx ? new Date(tx.blockTime * 1000).toLocaleString() : '—'}</span>
            </div>
            <div className="info-row">
              <span className="label">Fee</span>
              <span className="value mono">{tx?.fee || 0.000005} SOL</span>
            </div>
            <div className="info-row">
              <span className="label">From</span>
              <span className="value">
                <Link to={`/account/${tx?.from}`} className="address-link mono">
                  {tx?.from || '—'}
                </Link>
              </span>
            </div>
            <div className="info-row">
              <span className="label">To</span>
              <span className="value">
                <Link to={`/account/${tx?.to}`} className="address-link mono">
                  {tx?.to || '—'}
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Account Detail ────────────────────────────────────────────────────────

export const AccountDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (address) {
      fetchAccount(address).then(setAccount);
    }
  }, [address]);

  const handleCopy = () => {
    navigator.clipboard.writeText(address || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Account</h1>
        </div>

        <div className="signature-card">
          <span className="label">Address</span>
          <code className="value">{address}</code>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <a 
            href={`https://solscan.io/account/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="external-btn"
          >
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">SOL Balance</span>
              <span className="stat-value">{account?.balance?.toFixed(4) || '0'} SOL</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">$CCH Balance</span>
              <span className="stat-value">{formatNumber(account?.cchBalance || 0)} CCH</span>
            </div>
          </div>
        </div>

        {account?.isAgent && (
          <div className="card agent-card">
            <div className="card-header">
              <h3 className="card-title">
                <Cpu size={18} /> AI Agent
              </h3>
            </div>
            <div className="card-body">
              <p>This account is a registered AI agent on Claude Chain.</p>
              <Link to={`/agent/${address}`} className="btn btn-primary">
                View Agent Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Agents Page ───────────────────────────────────────────────────────────

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAgents();
      setAgents(data.agents);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">AI Agents</h1>
            <p className="page-subtitle">Autonomous agents running on Claude Chain</p>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon"><Users size={20} /></div>
            <div className="stat-content">
              <span className="stat-label">Total Agents</span>
              <span className="stat-value">{agents.length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Activity size={20} /></div>
            <div className="stat-content">
              <span className="stat-label">Active</span>
              <span className="stat-value">{agents.filter(a => a.status === 'active').length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><MessageSquare size={20} /></div>
            <div className="stat-content">
              <span className="stat-label">Total Messages</span>
              <span className="stat-value">{formatNumber(agents.reduce((sum, a) => sum + a.totalMessages, 0))}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="agents-grid">
            {agents.map((agent, idx) => (
              <Link key={idx} to={`/agent/${agent.address}`} className="agent-card-item">
                <div className="agent-header">
                  <div className="agent-avatar">
                    <ClaudeLogo size={48} />
                    <span className={`status-dot ${agent.status}`} />
                  </div>
                  <div className="agent-info">
                    <h3 className="agent-name">{agent.name}</h3>
                    <span className={`agent-status ${agent.status}`}>{agent.status}</span>
                  </div>
                </div>
                <p className="agent-desc">{agent.description}</p>
                <div className="agent-stats">
                  <div className="stat">
                    <Activity size={14} />
                    <span>{formatNumber(agent.totalTransactions)} txs</span>
                  </div>
                  <div className="stat">
                    <MessageSquare size={14} />
                    <span>{formatNumber(agent.totalMessages)} msgs</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Agent Detail ──────────────────────────────────────────────────────────

export const AgentDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (address) {
      fetchAgent(address).then(setAgent);
    }
  }, [address]);

  if (!agent) return <div className="page loading">Loading...</div>;

  return (
    <div className="page">
      <div className="container">
        <Link to="/agents" className="back-link">
          <ArrowLeft size={16} /> Back to Agents
        </Link>

        <div className="agent-detail-header">
          <div className="agent-avatar-large">
            <ClaudeLogo size={80} />
            <span className={`status-indicator ${agent.status}`} />
          </div>
          <div className="agent-info">
            <h1 className="agent-name">{agent.name}</h1>
            <p className="agent-desc">{agent.description}</p>
            <span className={`agent-status ${agent.status}`}>{agent.status}</span>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Transactions</span>
              <span className="stat-value">{formatNumber(agent.totalTransactions)}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Messages</span>
              <span className="stat-value">{formatNumber(agent.totalMessages)}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-label">Last Active</span>
              <span className="stat-value">{formatTimeAgo(Math.floor(agent.lastActive / 1000))}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Capabilities</h3>
          </div>
          <div className="card-body capabilities-list">
            {agent.capabilities.map((cap, idx) => (
              <span key={idx} className="capability-badge">{cap}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Tokens Page ───────────────────────────────────────────────────────────

export const TokensPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Tokens</h1>
      </div>

      <div className="token-hero">
        <ClaudeLogo size={64} />
        <div className="token-info">
          <h2>$CCH - Claude Chain Token</h2>
          <p>The native token powering the Claude Chain ecosystem</p>
          <div className="token-address">
            <span className="label">Contract:</span>
            <code>{CCH_TOKEN_ADDRESS}</code>
          </div>
        </div>
      </div>

      <div className="token-links">
        <a href={LINKS.jupiter} target="_blank" rel="noopener noreferrer" className="token-link">
          Buy on Jupiter
        </a>
        <a href={LINKS.dexscreener} target="_blank" rel="noopener noreferrer" className="token-link">
          DexScreener
        </a>
        <a href={LINKS.birdeye} target="_blank" rel="noopener noreferrer" className="token-link">
          Birdeye
        </a>
        <a href={LINKS.solscanToken} target="_blank" rel="noopener noreferrer" className="token-link">
          Solscan
        </a>
      </div>
    </div>
  </div>
);

// ─── Blocks Page ───────────────────────────────────────────────────────────

export const BlocksPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Blocks</h1>
        <p className="page-subtitle">Latest blocks on Solana</p>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 40, textAlign: 'center' }}>
          <p className="text-muted">Block data loading...</p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(0);
};

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default {
  TransactionsPage,
  TransactionDetail,
  AccountDetail,
  AgentsPage,
  AgentDetail,
  TokensPage,
  BlocksPage,
};
