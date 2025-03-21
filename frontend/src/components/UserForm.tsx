import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { User, UserInput } from "../types/user";
import { userService } from "../services/api";

interface UserFormProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: () => void;
}

export const UserForm = ({ open, user, onClose, onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState<UserInput>({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // No incluimos la contraseña en la edición
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        // Si estamos editando, solo enviamos los campos modificados
        const updateData: Partial<UserInput> = {};
        if (formData.name !== user.name) updateData.name = formData.name;
        if (formData.email !== user.email) updateData.email = formData.email;
        if (formData.password) updateData.password = formData.password;

        await userService.updateUser(user.id, updateData);
      } else {
        // Si estamos creando, enviamos todos los campos
        await userService.createUser(formData);
      }
      onSubmit();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            name="name"
            label="Nombre"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            name="email"
            label="Correo Electrónico"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            name="password"
            label={user ? "Contraseña (opcional)" : "Contraseña"}
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required={!user}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {user ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
