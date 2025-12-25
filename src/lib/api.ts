import { Transaction, FraudAlert, AccountProfile } from '@/types/fraud';
import { generateInitialTransactions, generateInitialAlerts, generateAccountProfile } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// For demo purposes, we'll use mock data
// In production, these would be real API calls

export async function fetchAccountTransactions(accountId: string): Promise<Transaction[]> {
  try {
    const response = await fetch(`${API_URL}/api/accounts/${accountId}/transactions`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.log('Using mock data for account transactions');
  }
  
  // Return mock data
  return generateInitialTransactions(50).map(txn => ({
    ...txn,
    accountId,
  }));
}

export async function fetchAccountAlerts(accountId: string): Promise<FraudAlert[]> {
  try {
    const response = await fetch(`${API_URL}/api/accounts/${accountId}/alerts`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.log('Using mock data for account alerts');
  }
  
  // Return mock data
  return generateInitialAlerts(10).map(alert => ({
    ...alert,
    accountId,
  }));
}

export async function fetchAccountProfile(accountId: string): Promise<AccountProfile> {
  try {
    const response = await fetch(`${API_URL}/api/accounts/${accountId}/profile`);
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.log('Using mock data for account profile');
  }
  
  // Return mock data
  const mockAlerts = await fetchAccountAlerts(accountId);
  return generateAccountProfile(accountId, mockAlerts.length);
}

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.log('Mock: Alert acknowledged');
    return true; // Simulate success
  }
}

export async function markFalsePositive(alertId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/alerts/${alertId}/false-positive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.log('Mock: Alert marked as false positive');
    return true;
  }
}

export async function freezeAccount(accountId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/accounts/${accountId}/freeze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.log('Mock: Account frozen');
    return true;
  }
}
