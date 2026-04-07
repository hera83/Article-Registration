import { requestJson } from './httpClient';
import type { AreaOption, CreateAreaInput, CreateTagInput, TagOption } from '../types/lookups';

export function getAreas(): Promise<AreaOption[]> {
  return requestJson<AreaOption[]>('/api/areas');
}

export function createArea(input: CreateAreaInput): Promise<AreaOption> {
  return requestJson<AreaOption>('/api/areas', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getTags(query = ''): Promise<TagOption[]> {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
  return requestJson<TagOption[]>(`/api/tags${suffix}`);
}

export function createTag(input: CreateTagInput): Promise<TagOption> {
  return requestJson<TagOption>('/api/tags', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}