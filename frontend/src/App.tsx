import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { UserList } from "./components/UserList";
import SalesManagement from "./components/SalesManagement";
import SalesReport from "./components/SalesReport";
import Navigation from "./components/Navigation";
import { Box, CssBaseline, Container } from "@mui/material";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Container maxWidth="lg" sx={{ flex: 1, width: "100%", pt: 2 }}>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <UserList />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <PrivateRoute>
                  <SalesManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales/report"
              element={
                <PrivateRoute>
                  <SalesReport />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/sales" />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
