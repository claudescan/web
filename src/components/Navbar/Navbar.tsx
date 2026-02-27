import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Menu, X, Copy, Check, ExternalLink } from 'lucide-react';
import { fetchNetworkStats } from '../../services/api';
import CONFIG, { LINKS } from '../../config';
import './Navbar.scss';

// Claude Chain Logo Component
export const ClaudeLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="claudeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6"/>
        <stop offset="50%" stopColor="#a78bfa"/>
        <stop offset="100%" stopColor="#c4b5fd"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="none" stroke="url(#claudeGrad)" strokeWidth="2" opacity="0.5"/>
    <circle cx="50" cy="50" r="42" fill="url(#claudeGrad)"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2"/>
    <g opacity="0.9">
      <path d="M50 15 L53 30 L50 25 L47 30 Z" fill="white" opacity="0.9"/>
      <path d="M50 85 L53 70 L50 75 L47 70 Z" fill="white" opacity="0.9"/>
      <path d="M15 50 L30 53 L25 50 L30 47 Z" fill="white" opacity="0.9"/>
      <path d="M85 50 L70 53 L75 50 L70 47 Z" fill="white" opacity="0.9"/>
      <path d="M25 25 L36 34 L32 32 L34 36 Z" fill="white" opacity="0.7"/>
      <path d="M75 75 L64 66 L68 68 L66 64 Z" fill="white" opacity="0.7"/>
      <path d="M75 25 L66 34 L68 32 L64 36 Z" fill="white" opacity="0.7"/>
      <path d="M25 75 L34 66 L32 68 L36 64 Z" fill="white" opacity="0.7"/>
    </g>
    <g transform="translate(50, 50)">
      <path 
        d="M8 -12 C-8 -12, -16 -4, -16 8 C-16 20, -8 28, 8 28 C14 28, 18 26, 20 22 L14 18 C12 20, 10 22, 6 22 C-2 22, -8 16, -8 8 C-8 0, -2 -6, 6 -6 C10 -6, 12 -4, 14 -2 L20 -6 C18 -10, 14 -12, 8 -12 Z" 
        fill="white" 
        transform="translate(-2, -8) scale(0.8)"
        opacity="0.95"
      />
    </g>
    <circle cx="50" cy="8" r="3" fill="white" opacity="0.8"/>
    <circle cx="92" cy="50" r="2.5" fill="white" opacity="0.6"/>
    <circle cx="50" cy="92" r="2" fill="white" opacity="0.5"/>
    <circle cx="8" cy="50" r="2.5" fill="white" opacity="0.6"/>
  </svg>
);

const ContractBadge: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONFIG.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="contract-badge">
      <span className="label">CA:</span>
      <span className="address">{CONFIG.contractAddress.slice(0, 6)}...{CONFIG.contractAddress.slice(-4)}</span>
      <button className="copy-btn" onClick={handleCopy} title="Copy contract address">
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
      <a 
        href={LINKS.solscanToken} 
        target="_blank" 
        rel="noopener noreferrer"
        className="external-btn"
        title="View on Solscan"
      >
        <ExternalLink size={12} />
      </a>
    </div>
  );
};

interface NavItemProps {
  label: string;
  to?: string;
  items?: { label: string; to: string; external?: boolean }[];
}

const NavItem: React.FC<NavItemProps> = ({ label, to, items }) => {
  const [open, setOpen] = useState(false);

  if (to && !items) {
    return (
      <div className="nav-item">
        <Link to={to} className="nav-link">{label}</Link>
      </div>
    );
  }

  return (
    <div 
      className="nav-item has-dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="nav-link">
        {label}
        <ChevronDown className={`chevron ${open ? 'rotated' : ''}`} size={12} />
      </button>
      {open && items && (
        <div className="dropdown">
          {items.map((item, idx) => (
            item.external ? (
              <a 
                key={idx} 
                href={item.to} 
                className="dropdown-item"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
                <ExternalLink size={12} />
              </a>
            ) : (
              <Link key={idx} to={item.to} className="dropdown-item">
                {item.label}
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [price, setPrice] = useState<{ price: number; change24h: number }>({ price: 0, change24h: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const stats = await fetchNetworkStats();
        setPrice({ price: stats.price, change24h: stats.priceChange24h });
      } catch (err) {
        console.error('Failed to fetch price:', err);
      }
    };
    loadPrice();
    const interval = setInterval(loadPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.trim();
    
    if (query.length >= 43 && query.length <= 88) {
      navigate(`/tx/${query}`);
    } else if (query.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      navigate(`/account/${query}`);
    } else if (/^\d+$/.test(query)) {
      navigate(`/block/${query}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
    
    setSearchQuery('');
  };

  const navItems = {
    blockchain: [
      { label: 'Transactions', to: '/transactions' },
      { label: 'Blocks', to: '/blocks' },
      { label: 'Top Accounts', to: '/accounts' },
    ],
    tokens: [
      { label: '$CCH Token', to: '/token/CCH' },
      { label: 'All Tokens', to: '/tokens' },
      { label: 'DexScreener', to: LINKS.dexscreener, external: true },
      { label: 'Jupiter', to: LINKS.jupiter, external: true },
    ],
    agents: [
      { label: 'All Agents', to: '/agents' },
      { label: 'Leaderboard', to: '/agents/leaderboard' },
      { label: 'Agent Chat', to: '/agents/chat' },
      { label: 'Deploy Agent', to: '/agents/deploy' },
    ],
    resources: [
      { label: 'Documentation', to: '/docs' },
      { label: 'API', to: '/api' },
      { label: 'GitHub', to: CONFIG.github, external: true },
    ],
  };

  const formatPrice = (p: number) => {
    if (p === 0) return '$—';
    if (p < 0.0001) return `$${p.toFixed(8)}`;
    if (p < 0.01) return `$${p.toFixed(6)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <nav className="claude-navbar">
      <div className="navbar-container">
        {/* Left: Logo + Price + Contract */}
        <div className="navbar-left">
          <Link to="/" className="logo">
            <ClaudeLogo size={36} />
            <span className="logo-text">CLAUDESCAN</span>
          </Link>
          
          <div className="price-badge">
            <ClaudeLogo size={18} />
            <span className="symbol">$CCH</span>
            <span className="price">{formatPrice(price.price)}</span>
            {price.change24h !== 0 && (
              <span className={`change ${price.change24h >= 0 ? 'positive' : 'negative'}`}>
                {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
              </span>
            )}
          </div>

          <ContractBadge />
        </div>

        {/* Center: Search */}
        <div className="navbar-center">
          <form className="search-wrapper" onSubmit={handleSearch}>
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by Address / Tx Hash / Block"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Search size={14} />
            </button>
          </form>
        </div>

        {/* Right: Nav Items */}
        <div className="navbar-right">
          <NavItem label="Blockchain" items={navItems.blockchain} />
          <NavItem label="Tokens" items={navItems.tokens} />
          <NavItem label="Agents" items={navItems.agents} />
          <NavItem label="Resources" items={navItems.resources} />

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Contract Address Banner */}
      <div className="contract-banner">
        <span className="banner-label">CONTRACT ADDRESS:</span>
        <span className="banner-address">{CONFIG.contractAddress}</span>
        <button 
          className="banner-copy"
          onClick={() => navigator.clipboard.writeText(CONFIG.contractAddress)}
        >
          <Copy size={14} /> Copy
        </button>
        <a href={LINKS.solscanToken} target="_blank" rel="noopener noreferrer" className="banner-link">
          View on Solscan <ExternalLink size={14} />
        </a>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-contract">
            <span className="label">CA:</span>
            <span className="address">{CONFIG.contractAddress}</span>
          </div>
          <Link to="/transactions" onClick={() => setMobileMenuOpen(false)}>Transactions</Link>
          <Link to="/blocks" onClick={() => setMobileMenuOpen(false)}>Blocks</Link>
          <Link to="/tokens" onClick={() => setMobileMenuOpen(false)}>Tokens</Link>
          <Link to="/agents" onClick={() => setMobileMenuOpen(false)}>Agents</Link>
          <Link to="/agents/chat" onClick={() => setMobileMenuOpen(false)}>Agent Chat</Link>
          <Link to="/docs" onClick={() => setMobileMenuOpen(false)}>Docs</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
