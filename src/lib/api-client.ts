// src/lib/api-client.ts
import { getCookie, removeCookie } from './cookies';
import { authClient } from './auth-client';

export interface FetchOptions extends RequestInit {
    useAuth?: boolean;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { useAuth = true, ...initOptions } = options;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

    // Ensure the endpoint starts with a slash if needed
    const separator = endpoint.startsWith('/') ? '' : '/';
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${separator}${endpoint}`;

    const headers = new Headers(initOptions.headers || {});

    if (useAuth) {
        const token = getCookie('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    if (!headers.has('Content-Type') && !(initOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const mergedOptions: RequestInit = {
        ...initOptions,
        headers,
    };

    try {
        const response = await fetch(url, mergedOptions);

        if (response.status === 401) {
            // Token is expired or unauthorized, perform a clean logout
            removeCookie('token');
            removeCookie('user');
            removeCookie('better-auth.session_token');
            removeCookie('__Secure-better-auth.session_token');

            authClient.signOut().catch(() => { });

            if (typeof window !== 'undefined') {
                window.location.href = '/login?expired=true';
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = 'An error occurred';
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.message || errorJson.error || errorMsg;
            } catch {
                errorMsg = errorText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        // Return empty object/null if 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json() as T;
    } catch (error: any) {
        console.error('API Fetch error:', error);
        throw error;
    }
}
