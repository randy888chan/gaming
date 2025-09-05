import React, { useState } from 'react';
import { useConnectKit } from '@particle-network/connectkit';
import { useAccount } from '@particle-network/connectkit';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { address, isConnected } = useAccount();
  const connectKit = useConnectKit();
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleClaimCredits = async () => {
    if (!address) return;

    setClaiming(true);
    setClaimStatus('idle');

    try {
      const response = await fetch('/api/v1/users/claim-first-play-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (response.ok) {
        setClaimStatus('success');
      } else {
        setClaimStatus('error');
      }
    } catch (error) {
      console.error('Error claiming credits:', error);
      setClaimStatus('error');
    } finally {
      setClaiming(false);
    }
  };

  const handleConnect = () => {
    connectKit.openConnectModal();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Game!</h2>
        <p className="mb-4">
          To get started, connect your wallet and claim your first play credits.
        </p>
        <div className="mb-4">
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        </div>

        {isConnected && (
          <div className="mt-4">
            <button
              onClick={handleClaimCredits}
              disabled={claiming || claimStatus === 'success'}
              className={`px-4 py-2 rounded ${
                claiming
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {claiming
                ? 'Claiming...'
                : claimStatus === 'success'
                ? 'Credits Claimed!'
                : 'Claim First Play Credits'}
            </button>
            {claimStatus === 'error' && (
              <p className="text-red-500 mt-2">Failed to claim credits. Please try again.</p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;