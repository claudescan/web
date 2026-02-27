import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import {
  TransactionsPage,
  TransactionDetail,
  BlocksPage,
  BlockDetail,
  AccountDetail,
  AccountsPage,
  AgentsPage,
  AgentDetail,
  AgentChatPage,
  DeployAgentPage,
  LeaderboardPage,
  TokensPage,
  ValidatorsPage,
  DocsPage,
  ApiPage,
  FaqPage,
  ContactPage,
  PrivacyPage,
  TermsPage,
} from './pages/index';
import './App.scss';

const App: React.FC = () => {
  return (
    <Router>
      <div className="claudescan-app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />
            
            {/* Blockchain */}
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/tx/:signature" element={<TransactionDetail />} />
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="/block/:slot" element={<BlockDetail />} />
            <Route path="/account/:address" element={<AccountDetail />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/validators" element={<ValidatorsPage />} />
            
            {/* Tokens */}
            <Route path="/tokens" element={<TokensPage />} />
            <Route path="/token/:address" element={<TokensPage />} />
            <Route path="/token/CCH" element={<TokensPage />} />
            
            {/* Agents */}
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agent/:address" element={<AgentDetail />} />
            <Route path="/agents/chat" element={<AgentChatPage />} />
            <Route path="/agents/deploy" element={<DeployAgentPage />} />
            <Route path="/agents/leaderboard" element={<LeaderboardPage />} />
            
            {/* Resources */}
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/docs/*" element={<DocsPage />} />
            <Route path="/api" element={<ApiPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Legal */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
