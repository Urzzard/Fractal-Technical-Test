import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Button, CircularProgress, Alert, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import { getAllProducts, deleteProduct } from '../services/productService';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import ProductFormModal from '../components/modals/ProductFormModal';

function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [openProductFormModal, setOpenProductFormModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllProducts();
      setProducts(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setOpenDeleteModal(false);
      setProductToDelete(null);
      fetchProducts();
      enqueueSnackbar(`Product "${productToDelete.name}" deleted successfully!`, { variant: 'success' });
    } catch (err) {
      console.error('Failed to delete product:', err);
      enqueueSnackbar(err.message || 'Failed to delete product.', { variant: 'error' });
      setOpenDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setProductToDelete(null);
  };


  const handleOpenAddProductModal = () => {
    setProductToEdit(null);
    setOpenProductFormModal(true);
  };

  const handleOpenEditProductModal = (product) => {
    setProductToEdit(product);
    setOpenProductFormModal(true);
  };

  const handleCloseProductFormModal = () => {
    setOpenProductFormModal(false);
    setProductToEdit(null);
  };

  const handleProductFormSuccess = () => {
    handleCloseProductFormModal();
    fetchProducts();
  };


  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Manage Products
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddProductModal}
          startIcon={<AddIcon />}
        >
          Add New Product
        </Button>
      </Box>

      {products.length === 0 ? (
        <Typography>No products found. Add some!</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="products table">
            <TableHead>
              <TableRow
                sx={(theme) => ({
                  backgroundColor: theme.palette.mode === 'dark'
                    ? theme.palette.grey[700]
                    : theme.palette.grey[200],
                })}
              >
                <TableCell sx={{width: '80px'}}>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="center">Options</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Avatar
                      src={product.image_url || undefined}
                      alt={product.name}
                      variant="rounded"
                      sx={{ width: 56, height: 56, bgcolor: 'grey.200' }}
                    >
                      {!product.image_url && product.name ? product.name.charAt(0) : null}
                    </Avatar>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {product.name}
                  </TableCell>
                  <TableCell align="right">${parseFloat(product.unit_price).toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      aria-label="edit product"
                      onClick={() => handleOpenEditProductModal(product)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      aria-label="delete product"
                      onClick={() => handleDeleteClick(product)}
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
        title="Confirm Delete Product"
        message={`Are you sure you want to delete the product "${productToDelete?.name}"? This action cannot be undone.`}
      />

      {openProductFormModal && (
        <ProductFormModal
          open={openProductFormModal}
          onClose={handleCloseProductFormModal}
          onSuccess={handleProductFormSuccess}
          productToEdit={productToEdit}
        />
      )}
    </Paper>
  );
}

export default ProductsView;