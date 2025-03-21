import { useEffect, useState } from "react";
import "chart.js/auto";
import { Line, Bar } from "react-chartjs-2";
import { format } from "date-fns";
import { getSales, type SalesResponse } from "../services/salesService";
import { Box, Paper, TextField, Typography } from "@mui/material";

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
} as const;

export default function SalesReport() {
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    user_id: "",
  });

  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadSales = async () => {
    try {
      const data = await getSales({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        user_id: filters.user_id ? parseInt(filters.user_id) : undefined,
      });
      setSalesData(data);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  const salesByClientChart = salesData
    ? {
        labels: Object.keys(salesData.totals.sales_by_client),
        datasets: [
          {
            label: "Ventas por Cliente",
            data: Object.values(salesData.totals.sales_by_client),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
        ],
      }
    : null;

  const salesByUserChart = salesData
    ? {
        labels: salesData.totals.sales_by_user.map((item) => item.user),
        datasets: [
          {
            label: "Ventas por Usuario",
            data: salesData.totals.sales_by_user.map((item) => item.total),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          },
        ],
      }
    : null;

  const dailySalesChart = salesData
    ? {
        labels: salesData.sales.map((sale) =>
          format(new Date(sale.sale_date), "dd/MM/yyyy")
        ),
        datasets: [
          {
            label: "Ventas Diarias",
            data: salesData.sales.map((sale) => sale.total_amount),
            borderColor: "rgb(255, 99, 132)",
            tension: 0.1,
            fill: false,
          },
        ],
      }
    : null;

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reporte de Ventas
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            type="date"
            label="Fecha Inicio"
            value={filters.start_date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, start_date: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="Fecha Fin"
            value={filters.end_date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, end_date: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="number"
            label="ID de Usuario"
            value={filters.user_id}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, user_id: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Total de Ventas: ${salesData?.totals.total_sales.toFixed(2)}
        </Typography>
      </Paper>

      <Box
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}
      >
        {salesByClientChart && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ventas por Cliente
            </Typography>
            <Bar options={chartOptions} data={salesByClientChart} />
          </Paper>
        )}

        {salesByUserChart && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ventas por Usuario
            </Typography>
            <Bar options={chartOptions} data={salesByUserChart} />
          </Paper>
        )}
      </Box>

      {dailySalesChart && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Tendencia de Ventas
          </Typography>
          <Line options={chartOptions} data={dailySalesChart} />
        </Paper>
      )}
    </Box>
  );
}
