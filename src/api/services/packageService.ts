import apiClient from '../client';

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
    const response = await apiClient.post<{ subscriptionId: string }>('/subscription', {
      packageId,
      duration: 12 // Annual subscription
    });
    return response.data;
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