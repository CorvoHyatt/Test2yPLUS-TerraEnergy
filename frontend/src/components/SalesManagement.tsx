import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { format } from "date-fns";
import {
  getSales,
  createSale,
  updateSale,
  deleteSale,
  type Sale,
} from "../services/salesService";

interface SaleFormData {
  client: string;
  total_amount: string;
  sale_date: string;
  user_id: string;
}

const initialFormData: SaleFormData = {
  client: "",
  total_amount: "",
  sale_date: format(new Date(), "yyyy-MM-dd"),
  user_id: "",
};

export default function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<SaleFormData>(initialFormData);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await getSales();
      setSales(response.sales);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  const handleOpen = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        client: sale.client,
        total_amount: sale.total_amount.toString(),
        sale_date: format(new Date(sale.sale_date), "yyyy-MM-dd"),
        user_id: sale.user_id.toString(),
      });
    } else {
      setEditingSale(null);
      setFormData(initialFormData);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSale(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saleData = {
        client: formData.client,
        total_amount: parseFloat(formData.total_amount),
        sale_date: formData.sale_date,
        user_id: parseInt(formData.user_id),
      };

      if (editingSale) {
        await updateSale(editingSale.id, saleData);
      } else {
        await createSale(saleData);
      }

      handleClose();
      loadSales();
    } catch (error) {
      console.error("Error saving sale:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta venta?")) {
      try {
        await deleteSale(id);
        loadSales();
      } catch (error) {
        console.error("Error deleting sale:", error);
      }
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Ventas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Nueva Venta
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Monto Total</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id}</TableCell>
                <TableCell>{sale.client}</TableCell>
                <TableCell>
                  ${parseFloat(sale.total_amount.toString()).toFixed(2)}
                </TableCell>
                <TableCell>
                  {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{sale.user?.name || sale.user_id}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(sale)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(sale.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSale ? "Editar Venta" : "Nueva Venta"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Cliente"
              value={formData.client}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, client: e.target.value }))
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Monto Total"
              type="number"
              inputProps={{ step: "0.01", min: "0" }}
              value={formData.total_amount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  total_amount: e.target.value,
                }))
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.sale_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sale_date: e.target.value }))
              }
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="ID de Usuario"
              type="number"
              value={formData.user_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, user_id: e.target.value }))
              }
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingSale ? "Guardar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
