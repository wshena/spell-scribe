import axios, { AxiosRequestConfig, Method } from "axios";

// Simple in-memory cache
const cache = new Map<string, any>();

export interface FetcherOptions {
  method?: Method;
  params?: any;
  data?: any;
  headers?: Record<string, string>;
  cacheKey?: string;
  cacheTime?: number; // ms
}

export async function fetcher<T = any>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> {
  const {
    method = "GET",
    params,
    data,
    headers,
    cacheKey,
    cacheTime = 10000,
  } = options;
  const key = cacheKey || `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.timestamp < cacheTime) {
    return cached.value;
  }
  const config: AxiosRequestConfig = {
    url,
    method,
    params,
    data,
    headers,
  };
  const response = await axios(config);
  cache.set(key, { value: response.data, timestamp: now });
  return response.data;
}
