export interface IPCA {
  id: number;
  ano: number;
  percentual: number;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface CreateIPCAInput {
  ano: number;
  percentual: number;
}

export interface UpdateIPCAInput {
  percentual: number;
}
