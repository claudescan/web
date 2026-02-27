// ClaudeScan — All Page Components
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Copy, Check, ExternalLink, Activity, Cpu, Users, 
  MessageSquare, Send, Terminal, Code, Book, HelpCircle, Mail,
  RefreshCw, Shield, FileText, Zap
} from 'lucide-react';
import { 
  fetchTransactions, fetchTransaction, fetchAccount, fetchAgents, fetchAgent,
  fetchBlocks, sendAgentMessage, subscribeToTransactions, subscribeToBlocks,
  CCH_TOKEN_ADDRESS
} from '../services/api';
import type { Transaction, Account, Agent, Block, AgentMessage } from '../services/api';
import { ClaudeLogo } from '../components/Navbar/Navbar';
import CONFIG, { LINKS } from '../config';
import './Pages.scss';

// ─── Helper Functions ──────────────────────────────────────────────────────

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(0);
};

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

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

    // Real-time updates
    const unsub = subscribeToTransactions((newTx) => {
      setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
    });

    return () => unsub();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Transactions</h1>
            <p className="page-subtitle">Live $CCH transactions on Claude Chain</p>
          </div>
          <div className="live-badge">
            <span className="pulse" /> Live
          </div>
        </div>

        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
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
                  <tr key={tx.signature + idx} className="fade-in">
                    <td><span className={`status-dot ${tx.status}`} /></td>
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
    </div>
  );
};

// ─── Blocks Page ───────────────────────────────────────────────────────────

export const BlocksPage: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchBlocks(50);
      setBlocks(data);
      setLoading(false);
    };
    load();

    const unsub = subscribeToBlocks((newBlock) => {
      setBlocks(prev => [newBlock, ...prev.slice(0, 49)]);
    });

    return () => unsub();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Blocks</h1>
            <p className="page-subtitle">Latest blocks on Solana</p>
          </div>
          <div className="live-badge">
            <span className="pulse" /> Live
          </div>
        </div>

        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Block Hash</th>
                  <th>Time</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block, idx) => (
                  <tr key={block.slot} className="fade-in">
                    <td>
                      <Link to={`/block/${block.slot}`} className="hash-link mono">
                        {block.slot.toLocaleString()}
                      </Link>
                    </td>
                    <td className="mono">{block.blockhash.slice(0, 20)}...</td>
                    <td className="time-cell">{formatTimeAgo(block.blockTime)}</td>
                    <td className="mono">{block.transactions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    if (signature) fetchTransaction(signature).then(setTx);
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
          {tx && <span className={`status-badge ${tx.status}`}>{tx.status}</span>}
        </div>

        <div className="signature-card">
          <span className="label">Signature</span>
          <code className="value">{signature}</code>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noopener noreferrer" className="external-btn">
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Overview</h3></div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Status</span>
              <span className="value"><span className={`status-badge ${tx?.status || 'success'}`}>{tx?.status || 'Success'}</span></span>
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
                <Link to={`/account/${tx?.from}`} className="address-link mono">{tx?.from || '—'}</Link>
              </span>
            </div>
            <div className="info-row">
              <span className="label">To</span>
              <span className="value">
                <Link to={`/account/${tx?.to}`} className="address-link mono">{tx?.to || '—'}</Link>
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
    if (address) fetchAccount(address).then(setAccount);
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
          <a href={`https://solscan.io/account/${address}`} target="_blank" rel="noopener noreferrer" className="external-btn">
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">SOL Balance</span>
            <span className="stat-value">{account?.balance?.toFixed(4) || '0'} SOL</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">$CCH Balance</span>
            <span className="stat-value">{formatNumber(account?.cchBalance || 0)} CCH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Agents Page ───────────────────────────────────────────────────────────

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    fetchAgents().then(data => setAgents(data.agents));
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">AI Agents</h1>
            <p className="page-subtitle">Autonomous agents on Claude Chain</p>
          </div>
          <Link to="/agents/deploy" className="btn btn-primary">
            <Cpu size={14} /> Deploy Agent
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><span className="stat-label">Total Agents</span><span className="stat-value">{agents.length}</span></div>
          <div className="stat-card"><span className="stat-label">Active</span><span className="stat-value">{agents.filter(a => a.status === 'active').length}</span></div>
          <div className="stat-card"><span className="stat-label">Total Messages</span><span className="stat-value">{formatNumber(agents.reduce((sum, a) => sum + a.totalMessages, 0))}</span></div>
        </div>

        <div className="agents-grid">
          {agents.map((agent, idx) => (
            <Link key={idx} to={`/agent/${agent.address}`} className="agent-card">
              <div className="agent-header">
                <ClaudeLogo size={48} />
                <span className={`status-dot ${agent.status}`} />
              </div>
              <h3 className="agent-name">{agent.name}</h3>
              <p className="agent-desc">{agent.description}</p>
              <div className="agent-stats">
                <span><Activity size={14} /> {formatNumber(agent.totalTransactions)} txs</span>
                <span><MessageSquare size={14} /> {formatNumber(agent.totalMessages)} msgs</span>
              </div>
              <span className={`agent-status ${agent.status}`}>{agent.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Agent Chat Page ───────────────────────────────────────────────────────

export const AgentChatPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgents().then(data => {
      setAgents(data.agents);
      if (data.agents.length > 0) setSelectedAgent(data.agents[0]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || loading) return;

    const userMsg: AgentMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAgentMessage(selectedAgent.address, input);
      setMessages(prev => [...prev, response]);
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page chat-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title"><MessageSquare size={24} /> Agent Chat</h1>
        </div>

        <div className="chat-container">
          <div className="chat-sidebar">
            <h3>Select Agent</h3>
            {agents.map(agent => (
              <button
                key={agent.address}
                className={`agent-select ${selectedAgent?.address === agent.address ? 'active' : ''}`}
                onClick={() => setSelectedAgent(agent)}
              >
                <ClaudeLogo size={32} />
                <div className="agent-info">
                  <span className="name">{agent.name}</span>
                  <span className={`status ${agent.status}`}>{agent.status}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="chat-main">
            <div className="chat-header">
              {selectedAgent && (
                <>
                  <ClaudeLogo size={40} />
                  <div>
                    <h3>{selectedAgent.name}</h3>
                    <p>{selectedAgent.description}</p>
                  </div>
                </>
              )}
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-empty">
                  <Terminal size={48} />
                  <p>Start a conversation with {selectedAgent?.name || 'an agent'}</p>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  {msg.role === 'agent' && <ClaudeLogo size={24} />}
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="message agent">
                  <ClaudeLogo size={24} />
                  <div className="message-content typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Deploy Agent Page ─────────────────────────────────────────────────────

export const DeployAgentPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', description: '', personality: '', capabilities: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Agent deployment will be available soon! Join our X for updates: ' + CONFIG.twitter);
  };

  return (
    <div className="page">
      <div className="container">
        <Link to="/agents" className="back-link"><ArrowLeft size={16} /> Back to Agents</Link>
        
        <div className="page-header">
          <h1 className="page-title"><Cpu size={24} /> Deploy AI Agent</h1>
          <p className="page-subtitle">Create and deploy your own AI agent on Claude Chain</p>
        </div>

        <div className="deploy-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Agent Name</label>
              <input type="text" placeholder="e.g., TradingBot" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="What does your agent do?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Personality</label>
              <input type="text" placeholder="e.g., Analytical and precise" value={form.personality} onChange={e => setForm({...form, personality: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Capabilities (comma separated)</label>
              <input type="text" placeholder="e.g., trading, analytics, alerts" value={form.capabilities} onChange={e => setForm({...form, capabilities: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              <Zap size={18} /> Deploy Agent
            </button>
          </form>
          
          <div className="deploy-info">
            <h4>Requirements</h4>
            <ul>
              <li>Minimum 1,000 $CCH staked</li>
              <li>Valid Solana wallet</li>
              <li>Agent code or template</li>
            </ul>
            <p>Need help? Check our <Link to="/docs/agent-sdk">Agent SDK documentation</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Docs Page ─────────────────────────────────────────────────────────────

export const DocsPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><Book size={24} /> Documentation</h1>
        <p className="page-subtitle">Learn how to use ClaudeScan and build on Claude Chain</p>
      </div>

      <div className="docs-grid">
        <Link to="/docs/getting-started" className="doc-card">
          <Zap size={32} />
          <h3>Getting Started</h3>
          <p>Quick introduction to Claude Chain and $CCH token</p>
        </Link>
        <Link to="/docs/agent-sdk" className="doc-card">
          <Code size={32} />
          <h3>Agent SDK</h3>
          <p>Build and deploy AI agents on Claude Chain</p>
        </Link>
        <Link to="/api" className="doc-card">
          <Terminal size={32} />
          <h3>API Reference</h3>
          <p>REST API documentation for developers</p>
        </Link>
        <a href={CONFIG.github} target="_blank" rel="noopener noreferrer" className="doc-card">
          <ExternalLink size={32} />
          <h3>GitHub</h3>
          <p>Open source repositories and examples</p>
        </a>
      </div>
    </div>
  </div>
);

// ─── API Page ──────────────────────────────────────────────────────────────

export const ApiPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><Terminal size={24} /> API Documentation</h1>
        <p className="page-subtitle">ClaudeScan REST API for developers</p>
      </div>

      <div className="api-section">
        <h3>Base URL</h3>
        <code className="code-block">https://claudescan.io/api/v1</code>
      </div>

      <div className="api-section">
        <h3>Endpoints</h3>
        <div className="api-endpoint">
          <span className="method get">GET</span>
          <code>/transactions</code>
          <p>Get latest transactions</p>
        </div>
        <div className="api-endpoint">
          <span className="method get">GET</span>
          <code>/transactions/:signature</code>
          <p>Get transaction by signature</p>
        </div>
        <div className="api-endpoint">
          <span className="method get">GET</span>
          <code>/accounts/:address</code>
          <p>Get account details</p>
        </div>
        <div className="api-endpoint">
          <span className="method get">GET</span>
          <code>/agents</code>
          <p>List all AI agents</p>
        </div>
        <div className="api-endpoint">
          <span className="method get">GET</span>
          <code>/blocks</code>
          <p>Get latest blocks</p>
        </div>
      </div>
    </div>
  </div>
);

// ─── FAQ Page ──────────────────────────────────────────────────────────────

export const FaqPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><HelpCircle size={24} /> FAQ</h1>
      </div>

      <div className="faq-list">
        <div className="faq-item">
          <h3>What is Claude Chain?</h3>
          <p>Claude Chain is an AI-powered blockchain ecosystem built on Solana, featuring autonomous AI agents and the $CCH token.</p>
        </div>
        <div className="faq-item">
          <h3>What is $CCH?</h3>
          <p>$CCH is the native token of Claude Chain. Contract: <code>{CONFIG.contractAddress}</code></p>
        </div>
        <div className="faq-item">
          <h3>How do I buy $CCH?</h3>
          <p>You can buy $CCH on <a href={LINKS.jupiter} target="_blank" rel="noopener noreferrer">Jupiter</a> or <a href={LINKS.raydium} target="_blank" rel="noopener noreferrer">Raydium</a>.</p>
        </div>
        <div className="faq-item">
          <h3>What are AI Agents?</h3>
          <p>AI Agents are autonomous programs that run on Claude Chain, performing tasks like trading, analytics, and content creation.</p>
        </div>
        <div className="faq-item">
          <h3>How do I deploy an agent?</h3>
          <p>Visit the <Link to="/agents/deploy">Deploy Agent</Link> page and follow the instructions. You'll need at least 1,000 $CCH staked.</p>
        </div>
      </div>
    </div>
  </div>
);

// ─── Contact Page ──────────────────────────────────────────────────────────

export const ContactPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><Mail size={24} /> Contact</h1>
      </div>

      <div className="contact-grid">
        <a href={CONFIG.twitter} target="_blank" rel="noopener noreferrer" className="contact-card">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <h3>X (Twitter)</h3>
          <p>@claudescanio</p>
        </a>
        <a href={CONFIG.github} target="_blank" rel="noopener noreferrer" className="contact-card">
          <ExternalLink size={32} />
          <h3>GitHub</h3>
          <p>github.com/claudescan</p>
        </a>
      </div>
    </div>
  </div>
);

// ─── Privacy & Terms ───────────────────────────────────────────────────────

export const PrivacyPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><Shield size={24} /> Privacy Policy</h1>
      </div>
      <div className="legal-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h3>Information We Collect</h3>
        <p>ClaudeScan collects publicly available blockchain data from the Solana network. We do not collect personal information unless you choose to contact us.</p>
        <h3>How We Use Information</h3>
        <p>Blockchain data is used to display transaction history, account balances, and agent activity on our platform.</p>
        <h3>Contact</h3>
        <p>Questions? Reach out on <a href={CONFIG.twitter} target="_blank" rel="noopener noreferrer">X</a>.</p>
      </div>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title"><FileText size={24} /> Terms of Service</h1>
      </div>
      <div className="legal-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h3>Acceptance of Terms</h3>
        <p>By using ClaudeScan, you agree to these terms.</p>
        <h3>Use of Service</h3>
        <p>ClaudeScan provides blockchain exploration tools. Use at your own risk. This is not financial advice.</p>
        <h3>Disclaimer</h3>
        <p>We provide information "as is" without warranty. Cryptocurrency involves risk.</p>
      </div>
    </div>
  </div>
);

// ─── Token Page ────────────────────────────────────────────────────────────

export const TokensPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">$CCH Token</h1>
      </div>

      <div className="token-hero">
        <ClaudeLogo size={80} />
        <div className="token-info">
          <h2>Claude Chain Token</h2>
          <p>The native token powering the Claude Chain ecosystem</p>
          <div className="token-contract">
            <span className="label">Contract:</span>
            <code>{CCH_TOKEN_ADDRESS}</code>
          </div>
        </div>
      </div>

      <div className="token-links">
        <a href={LINKS.jupiter} target="_blank" rel="noopener noreferrer" className="token-link primary">Buy on Jupiter</a>
        <a href={LINKS.raydium} target="_blank" rel="noopener noreferrer" className="token-link">Raydium</a>
        <a href={LINKS.dexscreener} target="_blank" rel="noopener noreferrer" className="token-link">DexScreener</a>
        <a href={LINKS.birdeye} target="_blank" rel="noopener noreferrer" className="token-link">Birdeye</a>
        <a href={LINKS.solscanToken} target="_blank" rel="noopener noreferrer" className="token-link">Solscan</a>
      </div>
    </div>
  </div>
);

// ─── Placeholder Pages ─────────────────────────────────────────────────────

export const AccountsPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Top Accounts</h1>
        <p className="page-subtitle">Largest $CCH holders</p>
      </div>
      <div className="card">
        <div className="card-body center">
          <Users size={48} />
          <p>Top accounts will be displayed once $CCH is deployed.</p>
          <p className="mono">{CONFIG.contractAddress}</p>
        </div>
      </div>
    </div>
  </div>
);

export const ValidatorsPage: React.FC = () => (
  <div className="page">
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Validators</h1>
      </div>
      <div className="card">
        <div className="card-body center">
          <Shield size={48} />
          <p>Claude Chain uses Solana's validator network.</p>
          <a href="https://solscan.io/validators" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            View Solana Validators <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  </div>
);

export const LeaderboardPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  
  useEffect(() => {
    fetchAgents().then(data => {
      const sorted = [...data.agents].sort((a, b) => b.totalMessages - a.totalMessages);
      setAgents(sorted);
    });
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Agent Leaderboard</h1>
        </div>
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Agent</th>
                  <th>Messages</th>
                  <th>Transactions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, idx) => (
                  <tr key={agent.address}>
                    <td className="rank">#{idx + 1}</td>
                    <td>
                      <Link to={`/agent/${agent.address}`} className="agent-link">
                        <ClaudeLogo size={24} />
                        {agent.name}
                      </Link>
                    </td>
                    <td className="mono">{formatNumber(agent.totalMessages)}</td>
                    <td className="mono">{formatNumber(agent.totalTransactions)}</td>
                    <td><span className={`status-badge ${agent.status}`}>{agent.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AgentDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (address) fetchAgent(address).then(setAgent);
  }, [address]);

  if (!agent) return <div className="page loading">Loading...</div>;

  return (
    <div className="page">
      <div className="container">
        <Link to="/agents" className="back-link"><ArrowLeft size={16} /> Back to Agents</Link>

        <div className="agent-detail-header">
          <ClaudeLogo size={80} />
          <div>
            <h1>{agent.name}</h1>
            <p>{agent.description}</p>
            <span className={`status-badge ${agent.status}`}>{agent.status}</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><span className="stat-label">Transactions</span><span className="stat-value">{formatNumber(agent.totalTransactions)}</span></div>
          <div className="stat-card"><span className="stat-label">Messages</span><span className="stat-value">{formatNumber(agent.totalMessages)}</span></div>
          <div className="stat-card"><span className="stat-label">Last Active</span><span className="stat-value">{formatTimeAgo(Math.floor(agent.lastActive / 1000))}</span></div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Capabilities</h3></div>
          <div className="card-body">
            <div className="capabilities">
              {agent.capabilities.map((cap, idx) => (
                <span key={idx} className="capability">{cap}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card-actions-row">
          <Link to="/agents/chat" className="btn btn-primary">
            <MessageSquare size={14} /> Chat with {agent.name}
          </Link>
        </div>
      </div>
    </div>
  );
};

// Catch-all for other routes
export const BlockDetail: React.FC = () => {
  const { slot } = useParams<{ slot: string }>();
  return (
    <div className="page">
      <div className="container">
        <Link to="/blocks" className="back-link"><ArrowLeft size={16} /> Back to Blocks</Link>
        <div className="page-header">
          <h1 className="page-title">Block #{slot}</h1>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="info-row"><span className="label">Slot</span><span className="value mono">{slot}</span></div>
            <div className="info-row"><span className="label">View on Solscan</span><span className="value"><a href={`https://solscan.io/block/${slot}`} target="_blank" rel="noopener noreferrer">Open <ExternalLink size={12} /></a></span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
