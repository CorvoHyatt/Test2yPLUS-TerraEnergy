import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Container,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { userService } from "../services/api";
import { User } from "../types/user";
import { UserForm } from "./UserForm";

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      // Verificar que data es un array antes de actualizar el estado
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Data received is not an array:", data);
        setError("Los datos recibidos no tienen el formato esperado");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setError("Error al cargar los usuarios. Por favor, inténtelo de nuevo.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este usuario?")) {
      setLoading(true);
      try {
        await userService.deleteUser(id);
        await loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        setError(
          "Error al eliminar el usuario. Por favor, inténtelo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = async () => {
    await loadUsers();
    handleFormClose();
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Gestión de Usuarios
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenForm(true)}
        sx={{ mb: 2 }}
        disabled={loading}
      >
        Nuevo Usuario
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
        >
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(user)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(user.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay usuarios disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <UserForm
        open={openForm}
        user={selectedUser}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </Container>
  );
};
