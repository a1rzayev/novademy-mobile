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
    const response = await apiClient.get<Package[]>('/packages', { params });
    return response.data;
  }

  async getFeaturedPackages(): Promise<Package[]> {
    const response = await apiClient.get<Package[]>('/packages/featured');
    return response.data;
  }

  async getPackageById(packageId: string): Promise<Package> {
    const response = await apiClient.get<Package>(`/packages/${packageId}`);
    return response.data;
  }

  async purchasePackage(packageId: string): Promise<{ subscriptionId: string }> {
    const response = await apiClient.post<{ subscriptionId: string }>(`/packages/${packageId}/purchase`);
    return response.data;
  }

  async getActiveSubscriptions(): Promise<{
    id: string;
    packageId: string;
    packageTitle: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'cancelled';
  }[]> {
    const response = await apiClient.get('/subscriptions/active');
    return response.data;
  }
}

export default new PackageService(); 