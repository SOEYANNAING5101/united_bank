import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function useApi() {
    const { getToken } = useAuth();
    return useCallback(
        async (path, { method = 'GET', body, idempotencyKey  } = {}) => {
            const token = await getToken();
            const headers = {
                Authorization: `Bearer ${token}`,
            };
            if (body) {headers['Content-Type'] = 'application/json'};
            if (method!=='GET' ){
                headers['Idempotency-Key'] = idempotencyKey  || crypto.randomUUID();
            }
            const res = await fetch(`${baseUrl}${path}`,{
                method,
                headers,
                body:body ?JSON.stringify(body):undefined
            });
            const text = await res.text();
            const data = text ? JSON.parse(text) : null;
            if(!res.ok){
                const err = new Error(data?.message || "Something went wrong. Please try again")
                err.status = res.status;
                err.code = data?.code;
                err.retryAfter = res.headers.get("Retry-After")
                throw err;
            }
            return data
        },
        [getToken]
    )
};