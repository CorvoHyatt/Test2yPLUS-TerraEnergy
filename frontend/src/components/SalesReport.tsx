import { useEffect, useState } from "react";
import "chart.js/auto";
import { Line, Bar } from "react-chartjs-2";
import { format } from "date-fns";
import { getSales, type SalesResponse } from "../services/salesService";
import {
  trainModel,
  getPredictions,
  type SalesPrediction,
} from "../services/predictionService";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Container,
  CircularProgress,
  Grid,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
} from "@mui/material";

export default function SalesReport() {
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSales({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      });
      setSalesData(data);

      // Entrenar el modelo con los datos actuales
      await trainModel(data.sales);
      const predictions = await getPredictions(7);
      setPredictions(predictions);
    } catch (error) {
      console.error("Error loading sales:", error);
      setError("Error al cargar los datos. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadSales();
  };

  // Preparar datos para los gráficos existentes
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

  // Preparar datos para el gráfico de predicciones
  const predictionsChart = {
    labels: predictions.map((p) => format(new Date(p.date), "dd/MM/yyyy")),
    datasets: [
      {
        label: "Predicción de Ventas",
        data: predictions.map((p) => p.predicted_amount),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.1,
      },
    ],
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1200px" }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ mt: 4, textAlign: "center" }}
        >
          Reportes y Predicciones de Ventas
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
          <TextField
            label="Fecha Inicio"
            type="date"
            value={filters.start_date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, start_date: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Fecha Fin"
            type="date"
            value={filters.end_date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, end_date: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Ventas por Cliente
                  </Typography>
                  {salesByClientChart && <Bar data={salesByClientChart} />}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Ventas por Usuario
                  </Typography>
                  {salesByUserChart && <Bar data={salesByUserChart} />}
                </Paper>
              </Grid>
            </Grid>

            {/* Sección de Predicciones */}
            <Paper sx={{ mt: 4, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Predicción de Ventas (Próximos 7 días)
              </Typography>
              {predictions.length > 0 ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Line data={predictionsChart} />
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Fecha</TableCell>
                          <TableCell align="right">
                            Predicción de Venta
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {predictions.map((prediction) => (
                          <TableRow key={prediction.date}>
                            <TableCell>
                              {format(new Date(prediction.date), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell align="right">
                              ${prediction.predicted_amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography>No hay predicciones disponibles</Typography>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
}
