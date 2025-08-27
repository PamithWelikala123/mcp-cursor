/**
 * XAPIHub API Types
 */

export interface XAPIHubUser {
  id: string;
  username: string;
  email: string;
  createdOn: string;
  modifiedOn: string;
}

export interface XAPIHubOrganization {
  id: string;
  name: string;
  description?: string;
  organizationVisibility: string;
  createdOn: string;
  modifiedOn: string;
}

export interface XAPIHubProject {
  id: string;
  name: string;
  description?: string;
  enableKanbanBoard: boolean;
}

export interface ProjectSearchParams {
  organizationId: string;
  searchString?: string;
  isAssign?: boolean;
  page?: number;
  size?: number;
  isDefault?: boolean;
  sort?: string;
}

export interface ProjectSearchResponse {
  content: XAPIHubProject[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface XAPIHubConfig {
  baseUrl: string;
  token: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}