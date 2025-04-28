// src/utils/api.ts
export interface ApiResponse<T> {
    data?: T;
    error?: {
      message: string;
      code?: string;
      errors?: Record<string, string>;
    };
  }
  
  export class ApiError extends Error {
    constructor(
      public message: string,
      public code?: string,
      public errors?: Record<string, string>,
      public status?: number
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }
  
  export async function fetchApi<T>(
    url: string, 
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new ApiError(
          data.message || 'An error occurred',
          data.code,
          data.errors,
          response.status
        );
      }
  
      return { data };
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: { 
          message: error.message,
          code: error.code,
          errors: error.errors
        }};
      }
  
      if (error instanceof Error) {
        return { error: { message: error.message }};
      }
  
      return { error: { message: 'An unexpected error occurred' }};
    }
  }