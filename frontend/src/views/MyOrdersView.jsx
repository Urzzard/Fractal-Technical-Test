import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Typography, Button, CircularProgress, Alert, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Select, MenuItem, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAllOrders, deleteOrder, updateOrderStatus } from '../services/orderService';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { useSnackbar } from 'notistack';


function MyOrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'InProgress':
        return 'info';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllOrders();
      setOrders(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder(orderToDelete.id);
      setOpenDeleteModal(false);
      setOrderToDelete(null);
      fetchOrders();
      enqueueSnackbar(`Order #${orderToDelete.order_number} deleted successfully!`, { variant: 'success' });
    } catch (err) {
      console.error('Failed to delete order:', err);
      enqueueSnackbar(err.message || 'Failed to delete order.', { variant: 'error' });
      setError(err.message || 'Failed to delete order.');
      setOpenDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setOrderToDelete(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {

    try {
      await updateOrderStatus(orderId, newStatus);
      enqueueSnackbar(`Order status updated to ${newStatus}!`, { variant: 'success' });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      enqueueSnackbar(err.message || 'Failed to update status.', { variant: 'error' });
      fetchOrders();
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          My Orders
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/add-order"
          startIcon={<AddIcon />}
        >
          Add New Order
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Typography>No orders found. Create one!</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={(theme) =>({ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200] })}>
                <TableCell>ID</TableCell>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right"># Products</TableCell>
                <TableCell align="right">Final Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Options</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {order.id}
                  </TableCell>
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>{new Date(order.creation_date).toLocaleDateString()}</TableCell>
                  <TableCell align="right">{order.total_products_count}</TableCell>
                  <TableCell align="right">${parseFloat(order.total_final_price).toFixed(2)}</TableCell>
                  <TableCell>
                    {order.status === 'Completed' ? ( 
                       <Chip
                         label={order.status_display}
                         color={getStatusChipColor(order.status)}
                         size="small"
                       />
                    ) : (
                      <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={order.status === 'Completed'}
                          variant='standard'
                          disableUnderline
                          sx={{
                            fontSize: '0.8125rem',
                            padding: '4px 8px',
                            color: (theme) => theme.palette[getStatusChipColor(order.status)]?.main
                          }}
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="InProgress">In Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      aria-label="edit order"
                      onClick={() => navigate(`/add-order/${order.id}`)}
                      disabled={order.status === 'Completed'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      aria-label="delete order"
                      onClick={() => handleDeleteClick(order)}
                      /* disabled={order.status === 'Completed'} */
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ConfirmationModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete order #${orderToDelete?.order_number}? This action cannot be undone.`}
      />
    </Paper>
  );
}

export default MyOrdersView;