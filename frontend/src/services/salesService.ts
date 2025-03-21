import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export interface Sale {
  id: number;
  client: string;
  total_amount: number;
  sale_date: string;
  user_id: number;
  user?: {
    id: number;
    name: string;
  };
}

export interface SalesResponse {
  sales: Sale[];
  totals: {
    total_sales: number;
    sales_by_client: Record<string, number>;
    sales_by_user: Array<{
      user: string;
      total: number;
    }>;
  };
}

export const getSales = async (filters?: {
  start_date?: string;
  end_date?: string;
  user_id?: number;
}): Promise<SalesResponse> => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();

  if (filters?.start_date) params.append("start_date", filters.start_date);
  if (filters?.end_date) params.append("end_date", filters.end_date);
  if (filters?.user_id) params.append("user_id", filters.user_id.toString());

  const response = await axios.get<SalesResponse>(
    `${API_URL}/sales${params.toString() ? `?${params.toString()}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const createSale = async (sale: Omit<Sale, "id">): Promise<Sale> => {
  const token = localStorage.getItem("token");
  const response = await axios.post<Sale>(`${API_URL}/sales`, sale, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateSale = async (
  id: number,
  sale: Partial<Omit<Sale, "id">>
): Promise<Sale> => {
  const token = localStorage.getItem("token");
  const response = await axios.put<Sale>(`${API_URL}/sales/${id}`, sale, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteSale = async (id: number): Promise<void> => {
  const token = localStorage.getItem("token");
  await axios.delete(`${API_URL}/sales/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
