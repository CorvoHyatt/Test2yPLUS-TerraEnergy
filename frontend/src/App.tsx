import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { UserList } from "./components/UserList";
import { Box, CssBaseline, Container } from "@mui/material";
import { useState } from 'react'
import './App.css'
import SalesManagement from './components/SalesManagement'
import SalesReport from './components/SalesReport'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  const [currentView, setCurrentView] = useState<'management' | 'report'>('management')

  return (
    <Router>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Container maxWidth="lg" sx={{ flex: 1, width: "100%" }}>
          <nav className="bg-white shadow-sm mb-4">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex space-x-4 items-center">
                  <button
                    onClick={() => setCurrentView('management')}
                    className={`px-3 py-2 rounded-md ${
                      currentView === 'management' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    Gestión de Ventas
                  </button>
                  <button
                    onClick={() => setCurrentView('report')}
                    className={`px-3 py-2 rounded-md ${
                      currentView === 'report' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    Reportes
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4">
            {currentView === 'management' ? <SalesManagement /> : <SalesReport />}
          </main>

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
            <Route path="/" element={<Navigate to="/users" />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  )
}

export default App
