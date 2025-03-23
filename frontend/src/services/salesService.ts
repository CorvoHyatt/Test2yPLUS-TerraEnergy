import { api } from "./api";

export interface Sale {
  id: number;
  client: string;
  total_amount: string | number; // Puede venir como string del backend
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
  try {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    if (filters?.user_id) params.append("user_id", filters.user_id.toString());

    const response = await api.get<SalesResponse>(
      `/sales${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw error;
  }
};

export const createSale = async (sale: Omit<Sale, "id">): Promise<Sale> => {
  try {
    const response = await api.post<Sale>("/sales", sale);
    return response.data;
  } catch (error) {
    console.error("Error creating sale:", error);
    throw error;
  }
};

export const updateSale = async (
  id: number,
  sale: Partial<Omit<Sale, "id">>
): Promise<Sale> => {
  try {
    const response = await api.put<Sale>(`/sales/${id}`, sale);
    return response.data;
  } catch (error) {
    console.error("Error updating sale:", error);
    throw error;
  }
};

export const deleteSale = async (id: number): Promise<void> => {
  try {
    await api.delete(`/sales/${id}`);
  } catch (error) {
    console.error("Error deleting sale:", error);
    throw error;
  }
};
