import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Assuming a Label component exists

interface CreditConfig {
  enabled: boolean;
  creditAmountUSDC: number;
  chains: string[];
  treasuryWallet: string;
  kmsProvider: string;
}

interface CreditConfigErrors {
  enabled?: string;
  creditAmountUSDC?: string;
  chains?: string;
  treasuryWallet?: string;
  kmsProvider?: string;
}

const CreditConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<CreditConfig>({
    enabled: false,
    creditAmountUSDC: 0,
    chains: [],
    treasuryWallet: '',
    kmsProvider: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<CreditConfigErrors>({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/v1/admin/credit-config');
        const data = await response.json();
        if (data.success) {
          setConfig(data.config);
        } else {
          setError(data.error || 'Failed to fetch configuration.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error while fetching configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setValidationErrors({}); // Clear previous validation errors
    let hasErrors = false;
    const newErrors: CreditConfigErrors = {};

    if (config.creditAmountUSDC <= 0) {
      newErrors.creditAmountUSDC = 'Credit Amount (USDC) must be a positive number.';
      hasErrors = true;
    }
    if (!config.treasuryWallet) {
      newErrors.treasuryWallet = 'Treasury Wallet cannot be empty.';
      hasErrors = true;
    }
    if (config.chains.length === 0) {
      newErrors.chains = 'At least one chain must be specified.';
      hasErrors = true;
    }
    if (!config.kmsProvider) {
      newErrors.kmsProvider = 'KMS Provider cannot be empty.';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(newErrors);
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/v1/admin/credit-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Configuration saved successfully!');
        setConfig(data.config);
      } else {
        setError(data.error || 'Failed to save configuration.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while saving configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setValidationErrors((prevErrors: CreditConfigErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name as keyof CreditConfigErrors];
      return newErrors;
    });

    setConfig((prevConfig: CreditConfig) => {
      if (type === 'checkbox') {
        return { ...prevConfig, [name]: checked };
      } else if (name === 'chains') {
        return { ...prevConfig, [name]: value.split(',').map(chain => chain.trim()).filter(chain => chain !== '') };
      } else if (type === 'number') {
        const numericValue = Number(value);
        return { ...prevConfig, [name]: isNaN(numericValue) ? 0 : numericValue };
      }
      return { ...prevConfig, [name]: value };
    });
  };

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Credit Configuration Panel</h1>
      {message && <div className="text-green-500">{message}</div>}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            id="enabled"
            name="enabled"
            type="checkbox"
            checked={config.enabled}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <Label htmlFor="enabled">Enable Credit System</Label>
        </div>
        {validationErrors.enabled && (
          <p className="text-red-500 text-sm">{validationErrors.enabled}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="creditAmountUSDC">Credit Amount (USDC):</Label>
        <Input
          id="creditAmountUSDC"
          name="creditAmountUSDC"
          type="number"
          value={config.creditAmountUSDC}
          onChange={handleChange}
        />
        {validationErrors.creditAmountUSDC && (
          <p className="text-red-500 text-sm">{validationErrors.creditAmountUSDC}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="chains">Chains (comma-separated):</Label>
        <Input
          id="chains"
          name="chains"
          type="text"
          value={config.chains.join(', ')}
          onChange={handleChange}
        />
        {validationErrors.chains && (
          <p className="text-red-500 text-sm">{validationErrors.chains}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="treasuryWallet">Treasury Wallet:</Label>
        <Input
          id="treasuryWallet"
          name="treasuryWallet"
          type="text"
          value={config.treasuryWallet}
          onChange={handleChange}
        />
        {validationErrors.treasuryWallet && (
          <p className="text-red-500 text-sm">{validationErrors.treasuryWallet}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="kmsProvider">KMS Provider:</Label>
        <Input
          id="kmsProvider"
          name="kmsProvider"
          type="text"
          value={config.kmsProvider}
          onChange={handleChange}
        />
        {validationErrors.kmsProvider && (
          <p className="text-red-500 text-sm">{validationErrors.kmsProvider}</p>
        )}
      </div>
      <Button onClick={handleSave} disabled={loading}>
        Save Configuration
      </Button>
    </div>
  );
};

export default CreditConfigPanel;