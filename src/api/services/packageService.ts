import apiClient from '../client';
import { getUserId } from '../../utils/auth';

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface PackageResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  courseIds: string[];
}

export interface Package extends PackageResponse {
  courses?: Course[];
  courseCount: number;
  isPurchased?: boolean;
}

interface PurchaseRequest {
  packageId: string;
  userId: string;
  duration: number;
  paymentMethod: string;
  currency: string;
}

export interface Subscription {
  id: string;
  packageId: string;
  packageTitle: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'cancelled';
}

class PackageService {
  async getPackages(searchQuery?: string): Promise<Package[]> {
    const params = searchQuery ? { search: searchQuery } : undefined;
    const response = await apiClient.get<PackageResponse[]>('/package', { params });
    return response.data.map(this.mapPackageResponse);
  }

  async getFeaturedPackages(): Promise<Package[]> {
    const response = await apiClient.get<PackageResponse[]>('/packages/featured');
    return response.data.map(this.mapPackageResponse);
  }

  async getPackageById(packageId: string): Promise<Package> {
    try {
      console.log('Fetching package details for ID:', packageId);
      const response = await apiClient.get<PackageResponse>(`/package/${packageId}`);
      console.log('Package details response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      return this.mapPackageResponse(response.data);
    } catch (error: any) {
      console.error('Error fetching package details:', {
        message: error.message,
        response: {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        }
      });
      throw error;
    }
  }

  private mapPackageResponse(response: PackageResponse): Package {
    return {
      ...response,
      image: response.imageUrl || '',
      courses: [],
      courseCount: response.courseIds.length,
      isPurchased: false
    };
  }

  async isPackagePurchased(packageId: string): Promise<boolean> {
    try {
      const userId = await getUserId();
      if (!userId) return false;

      const subscriptions = await this.getActiveSubscriptions(userId);
      return subscriptions.some(sub => 
        sub.packageId === packageId && 
        sub.status === 'active' &&
        new Date(sub.expiryDate) > new Date()
      );
    } catch (error) {
      console.error('Error checking package purchase status:', error);
      return false;
    }
  }

  async purchasePackage(packageId: string): Promise<{ subscriptionId: string }> {
    const userId = await getUserId();
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }

    // Check if already purchased
    const isPurchased = await this.isPackagePurchased(packageId);
    if (isPurchased) {
      throw new Error('You have already purchased this package.');
    }

    const purchaseRequest: PurchaseRequest = {
      packageId,
      userId,
      duration: 12, // Annual subscription
      paymentMethod: 'credit_card', // Default payment method
      currency: 'USD' // Default currency
    };

    try {
      const response = await apiClient.post<{ subscriptionId: string }>('/subscription', purchaseRequest);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessage = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        throw new Error(`Validation failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  async getActiveSubscriptions(userId: string): Promise<Subscription[]> {
    const response = await apiClient.get<Subscription[]>(`/subscription/active/${userId}`);
    return response.data;
  }
}

export default new PackageService(); 