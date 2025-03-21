import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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
}) => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());

    const response = await axios.get<SalesResponse>(`${API_URL}/sales?${params}`);
    return response.data;
};

export const createSale = async (sale: Omit<Sale, 'id'>) => {
    const response = await axios.post<Sale>(`${API_URL}/sales`, sale);
    return response.data;
};

export const updateSale = async (id: number, sale: Partial<Omit<Sale, 'id'>>) => {
    const response = await axios.put<Sale>(`${API_URL}/sales/${id}`, sale);
    return response.data;
};

export const deleteSale = async (id: number) => {
    await axios.delete(`${API_URL}/sales/${id}`);
};