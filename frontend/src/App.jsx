import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, IconButton, Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7'; 

import MyOrdersView from './views/MyOrdersView';
import AEOrderView from './views/AEOrderView';
import { useThemeContext } from './contexts/ThemeContext';
import ProductsView from './views/ProductsView';

function App() {
  const { mode, toggleColorMode } = useThemeContext();

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Order Management
          </Typography>
          <Button color="inherit" component={Link} to="/products">Products</Button>
          <Button color="inherit" component={Link} to="/my-orders">My Orders</Button>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', ml: 1 }}>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>
      <Container sx={{ marginTop: 4, marginBottom: 4 }}>
        <Routes>

          <Route path="/" element={<MyOrdersView />} />
          <Route path="/my-orders" element={<MyOrdersView />} />
          <Route path="/add-order" element={<AEOrderView />} />
          <Route path="/add-order/:orderId" element={<AEOrderView />} />
          <Route path="/products" element={<ProductsView />} />
          
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
