import axios, { AxiosInstance, AxiosError } from 'axios';
import { XAPIHubUser, XAPIHubOrganization, XAPIHubConfig, APIResponse } from '../types/xapihub.js';

/**
 * XAPIHub API Client
 * Handles all communication with the XAPIHub API
 */
export class XAPIHubClient {
  private client: AxiosInstance;
  private config: XAPIHubConfig;

  constructor(config: XAPIHubConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('XAPIHub API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }



  /**
   * Get current user details
   * Corresponds to: GET /users/current-user
   */
  async getCurrentUser(): Promise<APIResponse<XAPIHubUser>> {
    try {
      const response = await this.client.get('/users/current-user');
      
      // Debug: Log the raw response to understand the actual structure
      console.error('Raw API Response:', JSON.stringify(response.data, null, 2));
      
      // Get user data from API response
      const userData = response.data;
      
      const user: XAPIHubUser = {
        // Map fields from API response
        id: userData.id || '',
        username: userData.userName || '',
        email: userData.emailAddress || '',
        createdOn: userData.createdOn,
        modifiedOn: userData.modifiedOn
      };

      return {
        success: true,
        data: user,
        message: 'User details retrieved successfully'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        message: `Failed to get current user: ${axiosError.response?.status || 'Unknown error'}`
      };
    }
  }

  /**
   * Get recent accessed organizations
   * Corresponds to: GET /platform/1.0.0/organizations/recent-accessed-organizations
   */
  async getAccessedOrganizations(): Promise<APIResponse<XAPIHubOrganization[]>> {
    try {
      const response = await this.client.get('organizations/recent-accessed-organizations');
      
      // Debug: Log the raw response to understand the actual structure
      console.error('Raw Organizations API Response:', JSON.stringify(response.data, null, 2));
      
      // Get organizations data from API response
      const organizationsData = response.data;
      
      // Handle both array response and object with array property
      let organizations: any[] = [];
      if (Array.isArray(organizationsData)) {
        organizations = organizationsData;
      } else if (organizationsData.recentAccessedOrganizationResourceList && Array.isArray(organizationsData.recentAccessedOrganizationResourceList)) {
        organizations = organizationsData.recentAccessedOrganizationResourceList;
      } else if (organizationsData.organizations && Array.isArray(organizationsData.organizations)) {
        organizations = organizationsData.organizations;
      } else if (organizationsData.data && Array.isArray(organizationsData.data)) {
        organizations = organizationsData.data;
      }

      const mappedOrganizations: XAPIHubOrganization[] = organizations.map((org: any) => ({
        id: org.id || '',
        name: org.name || org.displayName || '',
        description: org.description || '',
        organizationVisibility: org.visibility || org.organizationVisibility || 'PRIVATE',
        createdOn: org.createdOn || '',
        modifiedOn: org.modifiedOn || '',
      }));

      return {
        success: true,
        data: mappedOrganizations,
        message: 'Accessed organizations retrieved successfully'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        message: `Failed to get accessed organizations: ${axiosError.response?.status || 'Unknown error'}`
      };
    }
  }

  /**
   * Test the connection to XAPIHub API
   */
  async testConnection(): Promise<APIResponse<boolean>> {
    try {
      await this.getCurrentUser();
      return {
        success: true,
        data: true,
        message: 'Successfully connected to XAPIHub API'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        error: (error as Error).message,
        message: 'Failed to connect to XAPIHub API'
      };
    }
  }
}