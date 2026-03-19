/**
 * Dual Cloudinary Account Manager
 * Automatically switches between two Cloudinary accounts for load balancing
 */

export interface CloudinaryAccount {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
}

export class CloudinaryManager {
  private account1: CloudinaryAccount;
  private account2: CloudinaryAccount;
  private currentAccount: 1 | 2 = 1;

  constructor() {
    this.account1 = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      apiSecret: process.env.CLOUDINARY_API_SECRET!,
      uploadPreset: 'GSA-2025'
    };

    this.account2 = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_2!,
      apiKey: process.env.CLOUDINARY_API_KEY_2!,
      apiSecret: process.env.CLOUDINARY_API_SECRET_2!,
      uploadPreset: 'GSA-2025' // Same preset name, different account
    };
  }

  /**
   * Get current active account
   */
  getCurrentAccount(): CloudinaryAccount {
    return this.currentAccount === 1 ? this.account1 : this.account2;
  }

  /**
   * Switch to next account (load balancing)
   */
  switchAccount(): void {
    this.currentAccount = this.currentAccount === 1 ? 2 : 1;
    console.log(`Switched to Cloudinary account ${this.currentAccount}`);
  }

  /**
   * Get account for specific URL (to know which account to use for deletion)
   */
  getAccountFromUrl(url: string): CloudinaryAccount | null {
    if (url.includes(this.account1.cloudName)) {
      return this.account1;
    } else if (url.includes(this.account2.cloudName)) {
      return this.account2;
    }
    return null;
  }

  /**
   * Check if both accounts are configured
   */
  isDualSetup(): boolean {
    return !!(
      this.account1.cloudName && this.account1.apiKey && this.account1.apiSecret &&
      this.account2.cloudName && this.account2.apiKey && this.account2.apiSecret
    );
  }

  /**
   * Get account by preference (1 or 2)
   */
  getAccount(preference: 1 | 2): CloudinaryAccount {
    return preference === 1 ? this.account1 : this.account2;
  }

  /**
   * Smart account selection based on usage or random
   */
  getOptimalAccount(): CloudinaryAccount {
    // For now, use simple alternating. 
    // Later can be enhanced with usage tracking
    this.switchAccount();
    return this.getCurrentAccount();
  }
}

// Singleton instance
export const cloudinaryManager = new CloudinaryManager();