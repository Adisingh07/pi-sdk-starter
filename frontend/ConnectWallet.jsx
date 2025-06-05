import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const ConnectWallet = () => {
  const [loading, setLoading] = useState(false);
  const { user, login, logout } = useUser();

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (!window.Pi) throw new Error('Pi SDK not available');
      await window.Pi.init({ version: '2.0' });
      const scopes = ['username', 'payments'];
      const auth = await window.Pi.authenticate(scopes);

      const accessToken = auth?.accessToken;
      if (!accessToken) throw new Error('No access token received');

      const res = await axios.post(`${BASE_URL}/auth/pi-login`, { accessToken });
      const { token, user: userData } = res.data;

      localStorage.setItem('token', token);
      login(token, userData.piUsername, userData.role);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('token');
    logout();
  };

  return user?.username ? (
    <div className="flex items-center gap-4">
      <span>👋 {user.username}</span>
      <button onClick={handleDisconnect} className="px-4 py-2 bg-red-500 text-white rounded">Disconnect</button>
    </div>
  ) : (
    <button onClick={handleConnect} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
      {loading ? 'Connecting...' : '🔌 Connect Pi Wallet'}
    </button>
  );
};

export default ConnectWallet;