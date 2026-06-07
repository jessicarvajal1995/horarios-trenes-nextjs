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

async function internalRequest<T>({ method = 'GET', body, path, searchParams }: SofseRequest): Promise<T> {
  const url = new URL(`${SOFSE_BASE_URL}${path}`);
  searchParams?.forEach((value, key) => url.searchParams.append(key, value));

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

  if (!response.ok) {
    throw new Error(response.status === 403 ? UNAUTHORIZED : response.statusText);
  }

  return response.json() as Promise<T>;
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
