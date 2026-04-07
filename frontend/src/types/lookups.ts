export interface AreaOption {
  id: string;
  name: string;
  sortOrder: number;
}

export interface TagOption {
  id: string;
  name: string;
}

export interface CreateTagInput {
  name: string;
}

export interface CreateAreaInput {
  name: string;
}