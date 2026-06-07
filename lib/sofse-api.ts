import { generateCredentials } from './sofse-auth';

const SOFSE_BASE_URL = 'https://api-servicios.sofse.gob.ar/v1';
const AUTH_PATH = '/auth/authorize';
const UNAUTHORIZED = 'Unauthorized';

let token = '';

type SofseRequest = {
  method?: string;
  body?: unknown;
  path: string;
  searchParams?: URLSearchParams;
};

function isTokenExpired(value: string) {
  if (!value) {
    return true;
  }

  try {
    const payload = value.split('.')[1];
    const tokenData = JSON.parse(Buffer.from(payload, 'base64').toString()) as { exp?: number };
    return !tokenData.exp || Date.now() > tokenData.exp * 1000;
  } catch {
    return true;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function internalRequest<T>({ method = 'GET', body, path, searchParams }: SofseRequest): Promise<T> {
  const url = new URL(`${SOFSE_BASE_URL}${path}`);
  searchParams?.forEach((value, key) => url.searchParams.append(key, value));

  const maxAttempts = method === 'GET' ? 4 : 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          'User-Agent': 'okhttp/4.9.0',
          'Cache-Control': 'no-cache',
          ...(token ? { Authorization: token } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store'
      });

      if (response.ok) {
        return response.json() as Promise<T>;
      }

      if (response.status === 403) {
        throw new Error(UNAUTHORIZED);
      }

      const message = await response.text();
      lastError = new Error(message || response.statusText);

      if (response.status < 500 || attempt === maxAttempts) {
        throw lastError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('SOFSE request failed');

      if (lastError.message === UNAUTHORIZED || attempt === maxAttempts) {
        throw lastError;
      }
    }

    await wait(150 * attempt);
  }

  throw lastError ?? new Error('SOFSE request failed');
}

async function generateToken() {
  const response = await internalRequest<{ token: string }>({
    method: 'POST',
    body: generateCredentials(),
    path: AUTH_PATH
  });

  token = response.token;
}

export async function requestSofse(path: string, searchParams: URLSearchParams) {
  try {
    if (isTokenExpired(token)) {
      throw new Error(UNAUTHORIZED);
    }

    return await internalRequest({ path, searchParams });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      await generateToken();
      return internalRequest({ path, searchParams });
    }

    throw error;
  }
}
