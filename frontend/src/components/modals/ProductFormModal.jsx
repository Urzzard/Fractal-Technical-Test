import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Grid,
  CircularProgress, Alert, Box, Avatar, Typography
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { createProduct, updateProduct } from '../../services/productService';

function ProductFormModal({ open, onClose, onSuccess, productToEdit }) {
  const [productName, setProductName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const isEditMode = Boolean(productToEdit);

  useEffect(() => {
    if (open) {
      if (isEditMode && productToEdit) {
        setProductName(productToEdit.name || '');
        setUnitPrice(productToEdit.unit_price || '');
        setCurrentImageUrl(productToEdit.image_url || null);
        setImageFile(null);
        setImagePreview(null);
      } else {
        setProductName('');
        setUnitPrice('');
        setImageFile(null);
        setImagePreview(null);
        setCurrentImageUrl(null);
      }
      setError(null);
    }
  }, [open, productToEdit, isEditMode]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setCurrentImageUrl(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', productName);
    formData.append('unit_price', unitPrice);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (isEditMode) {
        await updateProduct(productToEdit.id, formData);
        enqueueSnackbar('Product updated successfully!', { variant: 'success' });
      } else {
        await createProduct(formData);
        enqueueSnackbar('Product created successfully!', { variant: 'success' });
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save product:', err.response?.data || err.message);
      const apiError = err.response?.data;
      let errorMessage = 'Failed to save product.';
      if (typeof apiError === 'object' && apiError !== null) {
         
         const fieldErrors = Object.entries(apiError).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
         if (fieldErrors) errorMessage = fieldErrors;
      } else if (typeof apiError === 'string') {
         errorMessage = apiError;
      }
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const displayImage = imagePreview || currentImageUrl;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Product Name"
                fullWidth
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Unit Price"
                type="number"
                fullWidth
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
                InputProps={{ startAdornment: '$' }}
                inputProps={{ step: "0.01", min: "0.00" }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Product Image</Typography>
              {displayImage && (
                <Box sx={{ mb: 1, textAlign: 'center' }}>
                  <Avatar
                    src={displayImage}
                    alt="Product Preview"
                    variant="rounded"
                    sx={{ width: 100, height: 100, m: 'auto', border: '1px solid lightgray' }}
                  />
                </Box>
              )}
              <Button variant="outlined" component="label" fullWidth>
                {imageFile ? `Selected: ${imageFile.name}` : (isEditMode && currentImageUrl ? 'Change Image' : 'Upload Image')}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {imageFile && (
                  <Button size="small" color="warning" onClick={() => { setImageFile(null); setImagePreview(null); }} sx={{mt:1}}>
                      Clear selection
                  </Button>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving || !productName || !unitPrice}>
            {saving ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create Product')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default ProductFormModal;