import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ExternalLink, Twitter, Send, Github, MessageCircle } from 'lucide-react';
import { ClaudeLogo } from '../Navbar/Navbar';
import CONFIG, { LINKS } from '../../config';
import './Footer.scss';

const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONFIG.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="claude-footer">
      {/* Contract Address Section */}
      <div className="contract-section">
        <div className="container">
          <div className="contract-content">
            <div className="contract-label">
              <ClaudeLogo size={24} />
              <span>$CCH Contract Address</span>
            </div>
            <div className="contract-address-box">
              <code className="contract-address">{CONFIG.contractAddress}</code>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="contract-links">
              <a href={LINKS.solscanToken} target="_blank" rel="noopener noreferrer">
                Solscan <ExternalLink size={14} />
              </a>
              <a href={LINKS.dexscreener} target="_blank" rel="noopener noreferrer">
                DexScreener <ExternalLink size={14} />
              </a>
              <a href={LINKS.birdeye} target="_blank" rel="noopener noreferrer">
                Birdeye <ExternalLink size={14} />
              </a>
              <a href={LINKS.jupiter} target="_blank" rel="noopener noreferrer">
                Buy on Jupiter <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Link to="/" className="brand-logo">
                <ClaudeLogo size={40} />
                <div className="brand-text">
                  <span className="brand-name">ClaudeScan</span>
                  <span className="brand-tagline">Claude Chain Explorer</span>
                </div>
              </Link>
              <p className="brand-description">
                The premier blockchain explorer for Claude Chain. Track $CCH transactions, 
                monitor AI agents, and explore the autonomous economy built on Solana.
              </p>
              <div className="social-links">
                <a href={CONFIG.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
                  <Twitter size={18} />
                </a>
                <a href={CONFIG.telegram} target="_blank" rel="noopener noreferrer" title="Telegram">
                  <Send size={18} />
                </a>
                <a href={CONFIG.discord} target="_blank" rel="noopener noreferrer" title="Discord">
                  <MessageCircle size={18} />
                </a>
                <a href={CONFIG.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                  <Github size={18} />
                </a>
              </div>
            </div>

            {/* Blockchain Column */}
            <div className="footer-column">
              <h4>Blockchain</h4>
              <Link to="/transactions">Transactions</Link>
              <Link to="/blocks">Blocks</Link>
              <Link to="/accounts">Top Accounts</Link>
              <Link to="/tokens">Tokens</Link>
              <Link to="/validators">Validators</Link>
            </div>

            {/* Agents Column */}
            <div className="footer-column">
              <h4>AI Agents</h4>
              <Link to="/agents">All Agents</Link>
              <Link to="/agents/leaderboard">Leaderboard</Link>
              <Link to="/agents/chat">Agent Chat</Link>
              <Link to="/agents/deploy">Deploy Agent</Link>
              <Link to="/agents/docs">Agent SDK</Link>
            </div>

            {/* Resources Column */}
            <div className="footer-column">
              <h4>Resources</h4>
              <a href={CONFIG.docsUrl} target="_blank" rel="noopener noreferrer">Documentation</a>
              <Link to="/api">API</Link>
              <a href={CONFIG.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
            </div>

            {/* Trade Column */}
            <div className="footer-column">
              <h4>Trade $CCH</h4>
              <a href={LINKS.jupiter} target="_blank" rel="noopener noreferrer">Jupiter</a>
              <a href={LINKS.raydium} target="_blank" rel="noopener noreferrer">Raydium</a>
              <a href={LINKS.dexscreener} target="_blank" rel="noopener noreferrer">DexScreener</a>
              <a href={LINKS.birdeye} target="_blank" rel="noopener noreferrer">Birdeye</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            <p className="copyright">
              © 2025 ClaudeScan. Built on Claude Chain.
            </p>
            <div className="bottom-links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <span className="powered-by">
                Powered by <a href="https://solana.com" target="_blank" rel="noopener noreferrer">Solana</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
