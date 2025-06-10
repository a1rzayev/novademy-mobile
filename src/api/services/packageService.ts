import apiClient from '../client';
import { getUserId } from '../../utils/auth';

export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  courseCount: number;
  courses: {
    id: string;
    title: string;
    description: string;
    image: string;
  }[];
}

interface PurchaseRequest {
  packageId: string;
  userId: string;
  duration: number;
  paymentMethod: string;
  currency: string;
}

class PackageService {
  async getPackages(searchQuery?: string): Promise<Package[]> {
    const params = searchQuery ? { search: searchQuery } : undefined;
    const response = await apiClient.get<Package[]>('/package', { params });
    return response.data;
  }

  async getFeaturedPackages(): Promise<Package[]> {
    const response = await apiClient.get<Package[]>('/packages/featured');
    return response.data;
  }

  async getPackageById(packageId: string): Promise<Package> {
    const response = await apiClient.get<Package>(`/package/${packageId}`);
    return response.data;
  }

  async purchasePackage(packageId: string): Promise<{ subscriptionId: string }> {
    const userId = await getUserId();
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
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

  async getActiveSubscriptions(userId: string): Promise<{
    id: string;
    packageId: string;
    packageTitle: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'cancelled';
  }[]> {
    const response = await apiClient.get(`/subscription/active/${userId}`);
    return response.data;
  }
}

export default new PackageService(); 