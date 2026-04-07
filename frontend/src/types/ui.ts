export type SurfaceMode = 'solid' | 'glass';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: 'info' | 'success' | 'error';
}

export interface AppDialogState {
  id: string;
  title: string;
  description?: string;
}