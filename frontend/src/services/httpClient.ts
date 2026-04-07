export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error('Could not reach the backend API. Start the backend and try again.');
  }

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as {
        error?: string;
        title?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      };

      const validationMessage = payload.errors
        ? Object.values(payload.errors)
            .flat()
            .find(Boolean)
        : undefined;

      throw new Error(payload.error ?? validationMessage ?? payload.detail ?? payload.title ?? fallbackMessage);
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}