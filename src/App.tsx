import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Container,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CustomerList from "./components/customerList";
import TrainingList from "./components/trainingList";
import CalendarPage from "./components/CalendarPage"; // <-- uusi komponentti
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { getTrainings } from "./trainingApi";

function App() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const fetchTrainings = async () => {
    try {
      await getTrainings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Router>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Personal Trainer
          </Typography>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem component={Link} to="/customers" onClick={handleMenuClose}>
              Customers
            </MenuItem>
            <MenuItem component={Link} to="/trainings" onClick={handleMenuClose}>
              Trainings
            </MenuItem>
            <MenuItem component={Link} to="/calendar" onClick={handleMenuClose}>
              Calendar
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Routes>
          <Route
            path="/customers"
            element={<CustomerList fetchTrainings={fetchTrainings} />}
          />
          <Route path="/trainings" element={<TrainingList />} />
          <Route path="/calendar" element={<CalendarPage />} /> {/* Uusi reitti */}
          <Route
            path="/"
            element={<CustomerList fetchTrainings={fetchTrainings} />}
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;