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