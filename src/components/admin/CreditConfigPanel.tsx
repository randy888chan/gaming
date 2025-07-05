import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // Assuming a Label component exists

interface CreditConfigRules {
  enabled: boolean;
  creditAmountUSDC: number;
  chains: string[];
  treasuryWallet: string;
  kmsProvider: string;
}

interface CreditConfig {
  id: string;
  name: string;
  rules: CreditConfigRules;
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
    id: 'default-credit-config', // Assuming a default ID for the single config
    name: 'Default Credit Configuration', // Assuming a default name
    rules: {
      enabled: false,
      creditAmountUSDC: 0,
      chains: [],
      treasuryWallet: '',
      kmsProvider: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<CreditConfigErrors>({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/v1/admin/credit-config?id=${config.id}`);
        const data = await response.json();
        if (response.ok && data.success) {
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

    if (config.rules.creditAmountUSDC <= 0) {
      newErrors.creditAmountUSDC = 'Credit Amount (USDC) must be a positive number.';
      hasErrors = true;
    }
    if (!config.rules.treasuryWallet) {
      newErrors.treasuryWallet = 'Treasury Wallet cannot be empty.';
      hasErrors = true;
    }
    if (config.rules.chains.length === 0) {
      newErrors.chains = 'At least one chain must be specified.';
      hasErrors = true;
    }
    if (!config.rules.kmsProvider) {
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
      const method = config.id ? 'PUT' : 'POST'; // Use PUT for update, POST for create
      const response = await fetch('/api/v1/admin/credit-config', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: config.id, // Always send ID, backend will handle create/update based on existence
          name: config.name,
          rules: config.rules,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
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
      const newRules = { ...prevConfig.rules };
      if (type === 'checkbox') {
        (newRules as any)[name] = checked;
      } else if (name === 'chains') {
        newRules.chains = value.split(',').map(chain => chain.trim()).filter(chain => chain !== '');
      } else if (type === 'number') {
        const numericValue = Number(value);
        (newRules as any)[name] = isNaN(numericValue) ? 0 : numericValue;
      } else {
        (newRules as any)[name] = value;
      }
      return { ...prevConfig, rules: newRules };
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
            checked={config.rules.enabled}
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
          value={config.rules.creditAmountUSDC}
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
          value={config.rules.chains.join(', ')}
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
          value={config.rules.treasuryWallet}
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
          value={config.rules.kmsProvider}
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