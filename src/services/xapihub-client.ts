import axios, { AxiosInstance, AxiosError } from 'axios';
import { XAPIHubUser, XAPIHubOrganization, XAPIHubProject, XAPIHubCatalogue, XAPIHubAPI, XAPIHubConfig, APIResponse, ProjectSearchParams, ProjectSearchResponse, APIFilterParams, APIFilterResponse } from '../types/xapihub.js';

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
      const response = await this.client.get('/platform/1.0.0/users/current-user');
      
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
      const response = await this.client.get('/platform/1.0.0/organizations/recent-accessed-organizations');
      
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
   * Get recent accessed projects for a specific organization
   * Corresponds to: GET /project/1.0.0/organizations/{organizationId}/projects/recent-accessed-project
   */
  async getRecentAccessedProjects(organizationId: string): Promise<APIResponse<XAPIHubProject[]>> {
    try {
      const response = await this.client.get(`/project/1.0.0/organizations/${organizationId}/projects/recent-accessed-project`);
      
      // Debug: Log the raw response to understand the actual structure
      console.error('Raw Projects API Response:', JSON.stringify(response.data, null, 2));
      
      // Get projects data from API response
      const projectsData = response.data;
      
      // Handle both array response and object with array property
      let projects: any[] = [];
      if (Array.isArray(projectsData)) {
        projects = projectsData;
      } else if (projectsData.recentAccessedProjectResourceList && Array.isArray(projectsData.recentAccessedProjectResourceList)) {
        projects = projectsData.recentAccessedProjectResourceList;
      } else if (projectsData.projects && Array.isArray(projectsData.projects)) {
        projects = projectsData.projects;
      } else if (projectsData.data && Array.isArray(projectsData.data)) {
        projects = projectsData.data;
      } else if (projectsData.content && Array.isArray(projectsData.content)) {
        projects = projectsData.content;
      }

      const mappedProjects: XAPIHubProject[] = projects.map((project: any) => ({
        id: project.id || '',
        name: project.name || project.displayName || project.projectName || '',
        description: project.description || '',
        enableKanbanBoard: project.enableKanbanBoard || false
      }));

      return {
        success: true,
        data: mappedProjects,
        message: 'Recent accessed projects retrieved successfully'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        message: `Failed to get recent accessed projects: ${axiosError.response?.status || 'Unknown error'}`
      };
    }
  }

  /**
   * Search for projects in an organization with comprehensive parameters
   * Corresponds to: POST /project/1.0.0/organizations/{organizationId}/projects/search
   */
  async searchProjects(params: ProjectSearchParams): Promise<APIResponse<ProjectSearchResponse>> {
    try {
      const {
        organizationId,
        searchString = "",
        isAssign = true,
        page = 0,
        size = 12,
        isDefault = false,
        sort = "name,asc"
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams({
        isAssign: isAssign.toString(),
        page: page.toString(),
        size: size.toString(),
        isDefault: isDefault.toString(),
        sort: sort
      });

      // Make POST request with search string in body (matching the curl request exactly)
      const response = await this.client.post(
        `/project/1.0.0/organizations/${organizationId}/projects/search?${queryParams.toString()}`,
        { searchString },
        {
          headers: {
            'accept': 'text/html, application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'origin': 'https://dev.xapihub.io',
            'priority': 'u=1, i',
            'referer': 'https://dev.xapihub.io/',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
          }
        }
      );
      
      // Debug: Log the raw response to understand the actual structure
      console.error('Raw Project Search API Response:', JSON.stringify(response.data, null, 2));
      
      // Get projects data from API response
      const responseData = response.data;
      
      // Handle pagination response structure
      let projects: any[] = [];
      let totalElements = 0;
      let totalPages = 0;
      let currentSize = size;
      let currentPage = page;
      let isFirst = true;
      let isLast = true;

      if (responseData.content && Array.isArray(responseData.content)) {
        projects = responseData.content;
        totalElements = responseData.totalElements || 0;
        totalPages = responseData.totalPages || 0;
        currentSize = responseData.size || size;
        currentPage = responseData.number || page;
        isFirst = responseData.first !== undefined ? responseData.first : true;
        isLast = responseData.last !== undefined ? responseData.last : true;
      } else if (Array.isArray(responseData)) {
        projects = responseData;
        totalElements = responseData.length;
        totalPages = 1;
        isFirst = true;
        isLast = true;
      }

      const mappedProjects: XAPIHubProject[] = projects.map((project: any) => ({
        id: project.id || '',
        name: project.name || project.displayName || project.projectName || '',
        description: project.description || '',
        enableKanbanBoard: project.enableKanbanBoard || false
      }));

      const searchResponse: ProjectSearchResponse = {
        content: mappedProjects,
        totalElements,
        totalPages,
        size: currentSize,
        number: currentPage,
        first: isFirst,
        last: isLast
      };

      return {
        success: true,
        data: searchResponse,
        message: 'Project search completed successfully'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        message: `Failed to search projects: ${axiosError.response?.status || 'Unknown error'}`
      };
    }
  }

  /**
   * Get catalogues for a specific organization and project
   * Corresponds to: GET /api-design/1.0.0/organizations/{organizationId}/projects/{projectId}/catalogues
   */
  async getCatalogues(organizationId: string, projectId: string): Promise<APIResponse<XAPIHubCatalogue[]>> {
    try {
      const response = await this.client.get(
        `/api-design/1.0.0/organizations/${organizationId}/projects/${projectId}/catalogues`,
        {
          headers: {
            'accept': 'text/html, application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'origin': 'https://dev.xapihub.io',
            'priority': 'u=1, i',
            'referer': 'https://dev.xapihub.io/',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
          }
        }
      );
      
      // Debug: Log the raw response to understand the actual structure
      console.error('Raw Catalogues API Response:', JSON.stringify(response.data, null, 2));
      
      // Get catalogues data from API response
      const cataloguesData = response.data;
      
      // Handle both array response and object with array property
      let catalogues: any[] = [];
      if (Array.isArray(cataloguesData)) {
        catalogues = cataloguesData;
      } else if (cataloguesData.catalogues && Array.isArray(cataloguesData.catalogues)) {
        catalogues = cataloguesData.catalogues;
      } else if (cataloguesData.data && Array.isArray(cataloguesData.data)) {
        catalogues = cataloguesData.data;
      } else if (cataloguesData.content && Array.isArray(cataloguesData.content)) {
        catalogues = cataloguesData.content;
      }

      const mappedCatalogues: XAPIHubCatalogue[] = catalogues.map((catalogue: any) => ({
        id: catalogue.id || '',
        name: catalogue.name || catalogue.displayName || '',
        description: catalogue.description || '',
        version: catalogue.version || '',
        status: catalogue.status || '',
        createdOn: catalogue.createdOn || '',
        modifiedOn: catalogue.modifiedOn || '',
        rootCollectionId: catalogue.rootCollectionId || ''
      }));

      return {
        success: true,
        data: mappedCatalogues,
        message: 'Catalogues retrieved successfully'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        message: `Failed to get catalogues: ${axiosError.response?.status || 'Unknown error'}`
      };
    }
  }

  /**
   * Get APIs for a specific catalogue collection using filter endpoint
   * Corresponds to: POST /global-search-read/1.0.0/organizations/{organizationId}/projects/{projectId}/catalogues/{catalogueId}/collections/{collectionId}/apis/filter
   */
  async getApiDetails(params: APIFilterParams): Promise<APIResponse<APIFilterResponse>> {
    try {
      const {
        organizationId,
        projectId,
        catalogueId,
        collectionId,
        creators = [],
        collections = [],
        projects = [],
        page = 0,
        size = 8
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });

      // Build request body matching the curl command
      const requestBody = {
        creators,
        collections,
        projects
      };

      const response = await this.client.post(
        `/global-search-read/1.0.0/organizations/${organizationId}/projects/${projectId}/catalogues/${catalogueId}/collections/${collectionId}/apis/filter?${queryParams.toString()}`,
        requestBody,
        {
          headers: {
            'accept': 'text/html, application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'origin': 'https://dev.xapihub.io',
            'priority': 'u=1, i',
            'referer': 'https://dev.xapihub.io/',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
          }
        }
      );
      
      // Debug: Log the raw response to understand the actual structure
      console.error('Raw API Filter Response:', JSON.stringify(response.data, null, 2));
      
      // Get APIs data from API response
      const responseData = response.data;
      
      // Handle pagination response structure
      let apis: any[] = [];
      let totalElements = 0;
      let totalPages = 0;
      let currentSize = size;
      let currentPage = page;
      let isFirst = true;
      let isLast = true;

      if (responseData.content && Array.isArray(responseData.content)) {
        apis = responseData.content;
        totalElements = responseData.totalElements || 0;
        totalPages = responseData.totalPages || 0;
        currentSize = responseData.size || size;
        currentPage = responseData.number || page;
        isFirst = responseData.first !== undefined ? responseData.first : true;
        isLast = responseData.last !== undefined ? responseData.last : true;
      } else if (Array.isArray(responseData)) {
        apis = responseData;
        totalElements = responseData.length;
        totalPages = 1;
        isFirst = true;
        isLast = true;
      }

      const mappedApis: XAPIHubAPI[] = apis.map((api: any) => ({
        id: api.id || '',
        name: api.name || api.displayName || api.apiName || '',
        description: api.description || '',
        version: api.version || '',
        status: api.status || '',
        createdOn: api.createdOn || '',
        modifiedOn: api.modifiedOn || '',
        createdBy: api.createdBy || '',
        modifiedBy: api.modifiedBy || '',
        apiType: api.apiType || api.type || '',
        visibility: api.visibility || ''
      }));

      const apiFilterResponse: APIFilterResponse = {
        content: mappedApis,
        totalElements,
        totalPages,
        size: currentSize,
        number: currentPage,
        first: isFirst,
        last: isLast
      };

      return {
        success: true,
        data: apiFilterResponse,
        message: 'API details retrieved successfully'
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        message: `Failed to get API details: ${axiosError.response?.status || 'Unknown error'}`
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