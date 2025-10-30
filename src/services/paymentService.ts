import DeviceInfo from 'react-native-device-info';
import { AmazonIAPService } from './AmazonIAP';
import { FeatureFlags } from './FeatureFlags';

const API_BASE = 'https://xjxlcj4rxa.execute-api.us-east-1.amazonaws.com/prod';

export class PaymentService {
  private static deviceId: string | null = null;
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (!this.initialized && FeatureFlags.isEnabled('inAppPayments')) {
      await AmazonIAPService.initialize();
      this.initialized = true;
    }
  }

  static async getDeviceId(): Promise<string> {
    if (!this.deviceId) {
      this.deviceId = await DeviceInfo.getUniqueId();
    }
    return this.deviceId;
  }

  static async checkPaymentStatus(): Promise<boolean> {
    if (!FeatureFlags.isEnabled('inAppPayments')) {
      return true; // Grant access when payments disabled
    }

    try {
      const deviceId = await this.getDeviceId();
      const response = await fetch(`${API_BASE}/payments/${deviceId}`);
      const data = await response.json();
      return data.hasPaid || false;
    } catch (error) {
      console.log('Payment status check failed:', error);
      return false;
    }
  }

  static async processPayment(): Promise<boolean> {
    if (!FeatureFlags.isEnabled('inAppPayments')) {
      return true; // Always succeed when payments disabled
    }

    try {
      await this.initialize();
      
      // Step 1: Process Amazon IAP purchase
      console.log('Starting Amazon IAP purchase...');
      const purchaseResult = await AmazonIAPService.purchaseProduct('premium_ships');
      
      if (!purchaseResult.success) {
        console.log('Amazon IAP purchase failed');
        return false;
      }

      console.log('Amazon IAP purchase successful, receipt:', purchaseResult.receiptId);

      // Step 2: Record payment in backend
      const deviceId = await this.getDeviceId();
      const response = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deviceId,
          receiptId: purchaseResult.receiptId,
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      const success = data.success || false;
      
      console.log('Payment recorded in backend:', success);
      return success;
    } catch (error) {
      console.log('Payment processing failed:', error);
      return false;
    }
  }
}
