import { NativeModules } from 'react-native';

interface AmazonIAPModule {
  initializeIAP(): Promise<boolean>;
  purchaseProduct(sku: string): Promise<{success: boolean, receiptId?: string, error?: string}>;
  getUserData(): Promise<{userId: string, marketplace: string}>;
}

// This will be implemented as a native module
const { AmazonIAP } = NativeModules as { AmazonIAP: AmazonIAPModule };

export class AmazonIAPService {
  static async initialize(): Promise<boolean> {
    try {
      if (!AmazonIAP) {
        console.log('Amazon IAP not available - using mock implementation');
        return true;
      }
      return await AmazonIAP.initializeIAP();
    } catch (error) {
      console.error('IAP initialization failed:', error);
      return false;
    }
  }

  static async purchaseProduct(sku: string = 'premium_ships'): Promise<{success: boolean, receiptId?: string}> {
    try {
      if (!AmazonIAP) {
        // Mock implementation for development
        console.log('Mock IAP purchase for SKU:', sku);
        return { 
          success: true, 
          receiptId: `mock_receipt_${Date.now()}` 
        };
      }
      
      const result = await AmazonIAP.purchaseProduct(sku);
      return result;
    } catch (error) {
      console.error('IAP purchase failed:', error);
      return { success: false };
    }
  }

  static async getUserData(): Promise<{userId: string, marketplace: string} | null> {
    try {
      if (!AmazonIAP) {
        return { userId: 'mock_user', marketplace: 'US' };
      }
      return await AmazonIAP.getUserData();
    } catch (error) {
      console.error('Get user data failed:', error);
      return null;
    }
  }
}
