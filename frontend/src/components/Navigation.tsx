import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ flex: 1, display: "flex", gap: 2 }}>
          <Button
            color={location.pathname === "/users" ? "primary" : "inherit"}
            onClick={() => navigate("/users")}
          >
            Usuarios
          </Button>
          <Button
            color={location.pathname === "/sales" ? "primary" : "inherit"}
            onClick={() => navigate("/sales")}
          >
            Gestión de Ventas
          </Button>
          <Button
            color={
              location.pathname === "/sales/report" ? "primary" : "inherit"
            }
            onClick={() => navigate("/sales/report")}
          >
            Reportes y Prediciones
          </Button>
        </Box>
        <Button
          color="inherit"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Cerrar Sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
}
