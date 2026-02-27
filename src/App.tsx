import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import {
  TransactionsPage,
  TransactionDetail,
  AccountDetail,
  AgentsPage,
  AgentDetail,
  TokensPage,
  BlocksPage,
} from './pages/index';
import './App.scss';

const App: React.FC = () => {
  return (
    <Router>
      <div className="claudescan-app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/tx/:signature" element={<TransactionDetail />} />
            <Route path="/account/:address" element={<AccountDetail />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agent/:address" element={<AgentDetail />} />
            <Route path="/tokens" element={<TokensPage />} />
            <Route path="/token/:address" element={<TokensPage />} />
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="/block/:slot" element={<BlocksPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
