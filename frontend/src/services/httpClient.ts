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
    const responseText = await response.text();
    const errorMessage = extractErrorMessage(responseText);
    throw new Error(errorMessage ?? fallbackMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function extractErrorMessage(responseText: string): string | undefined {
  if (!responseText) {
    return undefined;
  }

  try {
    const payload = JSON.parse(responseText) as {
      error?: string;
      title?: string;
      detail?: string;
      errors?: Record<string, string[]>;
    };

    const validationMessage = payload.errors
      ? Object.entries(payload.errors)
          .flatMap(([key, messages]) => messages.map((message) => (key ? `${key}: ${message}` : message)))
          .find(Boolean)
      : undefined;

    return payload.error ?? validationMessage ?? payload.detail ?? payload.title;
  } catch {
    return responseText.trim() || undefined;
  }
}