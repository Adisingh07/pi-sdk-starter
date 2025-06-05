import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const RewardedAdButton = ({ label = 'Watch Ad', onRewarded }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleClick = async () => {
    if (!user?.token || !user?.username) return alert('Connect wallet first');
    setLoading(true);
    try {
      const isReady = await window.Pi.Ads.isAdReady('rewarded');
      if (!isReady.ready) {
        const requested = await window.Pi.Ads.requestAd('rewarded');
        if (requested.result !== 'AD_LOADED') throw new Error('Ad not available');
      }

      const showAd = await window.Pi.Ads.showAd('rewarded');
      if (showAd.result === 'AD_REWARDED') {
        const res = await axios.post(`${BASE_URL}/reward/credit`, { piUsername: user.username }, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        onRewarded?.(res.data);
      } else {
        throw new Error('Ad not completed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
      {loading ? 'Watching Ad...' : label}
    </button>
  );
};

export default RewardedAdButton;
