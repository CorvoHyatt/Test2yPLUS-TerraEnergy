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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function SalesReport() {
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    user_id: "",
  });
  const [predictionConfig, setPredictionConfig] = useState({
    predictionPeriod: 7,
    periodType: "days",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opciones predefinidas para períodos de predicción
  const predefinedPeriods = [
    { label: "7 días", value: 7, type: "days" },
    { label: "15 días", value: 15, type: "days" },
    { label: "1 mes", value: 1, type: "months" },
    { label: "3 meses", value: 3, type: "months" },
    { label: "6 meses", value: 6, type: "months" },
    { label: "1 año", value: 1, type: "year" },
  ];

  // Agregar un indicador visible para el entrenamiento del modelo
  const [modelTrained, setModelTrained] = useState(false);

  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadSales = async () => {
    setLoading(true);
    setError(null);
    setModelTrained(false);
    try {
      const salesData = await getSales({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        user_id: filters.user_id ? parseInt(filters.user_id) : undefined,
      });
      setSalesData(salesData);

      // Solo entrenar el modelo si hay datos suficientes
      if (salesData.sales.length > 0) {
        try {
          await trainModel(salesData.sales);
          setModelTrained(true);
        } catch (modelError) {
          console.error("Error training model:", modelError);
          // No establecemos error global para permitir mostrar al menos los datos históricos
        }

        // Calcular el período de predicción en días
        let predictionDays = predictionConfig.predictionPeriod;
        if (predictionConfig.periodType === "months") {
          predictionDays = predictionConfig.predictionPeriod * 30;
        } else if (predictionConfig.periodType === "year") {
          predictionDays = predictionConfig.predictionPeriod * 365;
        }

        try {
          // Obtener predicciones
          const predictions = await getPredictions({
            predictionPeriod: predictionDays,
            startDate:
              salesData.sales.length > 0
                ? salesData.sales[salesData.sales.length - 1].sale_date
                : undefined,
          });
          setPredictions(predictions);
        } catch (predictionError) {
          console.error("Error getting predictions:", predictionError);
          setPredictions([]);
          // Solo mostramos este error si el entrenamiento fue exitoso pero las predicciones fallaron
          if (modelTrained) {
            setError(
              "Error al obtener predicciones. Por favor, intente nuevamente."
            );
          }
        }
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error("Error loading sales:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar los datos"
      );
      setSalesData(null);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadSales();
  };

  // Preparar datos para el gráfico histórico de ventas
  const historicalSalesChart = salesData?.sales
    ? {
        labels: salesData.sales.map((sale) =>
          format(new Date(sale.sale_date), "dd/MM/yyyy")
        ),
        datasets: [
          {
            label: filters.user_id
              ? `Ventas de ${
                  salesData.totals.sales_by_user.find(
                    (u) => u.user.split(" - ")[0] === filters.user_id
                  )?.user || "Usuario"
                }`
              : "Ventas Históricas",
            data: salesData.sales.map((sale) =>
              parseFloat(sale.total_amount.toString())
            ),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            tension: 0.1,
          },
        ],
      }
    : null;

  // Preparar datos para los gráficos por cliente y usuario
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

  // Preparar datos para el gráfico de predicciones con intervalos de confianza
  const predictionsChart =
    predictions.length > 0
      ? {
          labels: predictions.map((p) =>
            format(new Date(p.date), "dd/MM/yyyy")
          ),
          datasets: [
            {
              label: "Predicción de Ventas",
              data: predictions.map((p) => p.predicted_amount),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              tension: 0.1,
              fill: false,
            },
            {
              label: "Límite Superior",
              data: predictions.map((p) => p.upper_bound),
              borderColor: "rgba(255, 99, 132, 0.2)",
              backgroundColor: "transparent",
              borderDash: [5, 5],
              tension: 0.1,
              fill: false,
            },
            {
              label: "Límite Inferior",
              data: predictions.map((p) => p.lower_bound),
              borderColor: "rgba(255, 99, 132, 0.2)",
              backgroundColor: "rgba(255, 99, 132, 0.1)",
              borderDash: [5, 5],
              tension: 0.1,
              fill: 1, // Rellena el área entre este dataset y el dataset 1 (Límite Superior)
            },
          ],
        }
      : null;

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
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Usuario</InputLabel>
            <Select
              value={filters.user_id}
              label="Usuario"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, user_id: e.target.value }))
              }
            >
              <MenuItem value="">Todos los usuarios</MenuItem>
              {salesData?.totals.sales_by_user.map((item) => (
                <MenuItem key={item.user} value={item.user.split(" - ")[0]}>
                  {item.user}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Período de Predicción</InputLabel>
            <Select
              value={`${predictionConfig.predictionPeriod}-${predictionConfig.periodType}`}
              label="Período de Predicción"
              onChange={(e) => {
                const [value, type] = e.target.value.split("-");
                setPredictionConfig({
                  predictionPeriod: parseInt(value),
                  periodType: type,
                });
              }}
            >
              {predefinedPeriods.map((period) => (
                <MenuItem
                  key={`${period.value}-${period.type}`}
                  value={`${period.value}-${period.type}`}
                >
                  {period.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={loadSales}
            sx={{ height: "56px" }}
          >
            Actualizar Predicción
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
            {/* Gráfico Histórico de Ventas */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Histórico de Ventas
                {filters.user_id && (
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "0.9rem",
                      marginLeft: "10px",
                    }}
                  >
                    (Filtrado por usuario:{" "}
                    {salesData?.totals.sales_by_user.find(
                      (u) => u.user.split(" - ")[0] === filters.user_id
                    )?.user || filters.user_id}
                    )
                  </span>
                )}
              </Typography>
              {historicalSalesChart && (
                <Line
                  data={historicalSalesChart}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Monto de Venta",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Fecha",
                        },
                      },
                    },
                  }}
                />
              )}
              {salesData?.sales.length === 0 && (
                <Typography
                  sx={{ textAlign: "center", my: 3, color: "text.secondary" }}
                >
                  No hay datos de ventas para mostrar con los filtros
                  seleccionados
                </Typography>
              )}
            </Paper>

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
                Predicción de Ventas ({predictionConfig.predictionPeriod}{" "}
                {predictionConfig.periodType === "days"
                  ? "días"
                  : predictionConfig.periodType === "months"
                  ? "meses"
                  : "año"}
                )
                {filters.user_id && (
                  <span
                    style={{
                      fontWeight: "normal",
                      fontSize: "0.9rem",
                      marginLeft: "10px",
                    }}
                  >
                    (Basado en datos de:{" "}
                    {salesData?.totals.sales_by_user.find(
                      (u) => u.user.split(" - ")[0] === filters.user_id
                    )?.user || filters.user_id}
                    )
                  </span>
                )}
              </Typography>
              {!modelTrained &&
                salesData &&
                salesData.sales &&
                salesData.sales.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    No se pudo entrenar el modelo predictivo. Las predicciones
                    podrían no ser precisas.
                  </Alert>
                )}
              {predictions.length > 0 ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Line
                      data={predictionsChart}
                      options={{
                        responsive: true,
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function (context: {
                                dataIndex: number;
                                dataset: { label: string };
                                raw: number;
                              }) {
                                const prediction =
                                  predictions[context.dataIndex];
                                if (
                                  context.dataset.label ===
                                  "Predicción de Ventas"
                                ) {
                                  return `Predicción: $${prediction.predicted_amount.toFixed(
                                    2
                                  )}`;
                                }
                                return (
                                  context.dataset.label + `: $${context.raw}`
                                );
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Monto Predicho",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Fecha",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Fecha</TableCell>
                          <TableCell align="right">Predicción</TableCell>
                          <TableCell align="right">
                            Rango de Confianza
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
                            <TableCell align="right">
                              ${prediction.lower_bound.toFixed(2)} - $
                              {prediction.upper_bound.toFixed(2)}
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
