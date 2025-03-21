import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getSales, type SalesResponse } from '../services/salesService';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesReport() {
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    user_id: ''
  });

  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadSales = async () => {
    try {
      const data = await getSales({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        user_id: filters.user_id ? parseInt(filters.user_id) : undefined
      });
      setSalesData(data);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const salesByClientChart = salesData ? {
    labels: Object.keys(salesData.totals.sales_by_client),
    datasets: [{
      label: 'Ventas por Cliente',
      data: Object.values(salesData.totals.sales_by_client),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  } : null;

  const salesByUserChart = salesData ? {
    labels: salesData.totals.sales_by_user.map(item => item.user),
    datasets: [{
      label: 'Ventas por Usuario',
      data: salesData.totals.sales_by_user.map(item => item.total),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  } : null;

  const dailySalesChart = salesData ? {
    labels: salesData.sales.map(sale => format(new Date(sale.sale_date), 'dd/MM/yyyy')),
    datasets: [{
      label: 'Ventas Diarias',
      data: salesData.sales.map(sale => sale.total_amount),
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }]
  } : null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reporte de Ventas</h1>
      
      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          className="border rounded p-2"
        />
        <input
          type="number"
          placeholder="ID de Usuario"
          value={filters.user_id}
          onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
          className="border rounded p-2"
        />
      </div>

      {/* Total de Ventas */}
      <div className="mb-6 p-4 bg-blue-100 rounded">
        <h2 className="text-xl font-semibold">Total de Ventas</h2>
        <p className="text-3xl">${salesData?.totals.total_sales.toFixed(2)}</p>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {salesByClientChart && (
          <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">Ventas por Cliente</h3>
            <Bar data={salesByClientChart} />
          </div>
        )}

        {salesByUserChart && (
          <div className="p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">Ventas por Usuario</h3>
            <Bar data={salesByUserChart} />
          </div>
        )}

        {dailySalesChart && (
          <div className="p-4 border rounded col-span-full">
            <h3 className="text-lg font-semibold mb-2">Tendencia de Ventas</h3>
            <Line data={dailySalesChart} />
          </div>
        )}
      </div>
    </div>
  );
}