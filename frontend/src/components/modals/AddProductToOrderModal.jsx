import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Typography, Box, Avatar } from '@mui/material';

function AddProductToOrderModal({ open, onClose, products, onAddProduct }) {
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);

    useEffect(() => {
        if (open) {
        setSelectedProductId('');
        setQuantity(1);
        setSelectedProductDetails(null);
        }
    }, [open, products]);

    useEffect(() => {
        if (selectedProductId) {
        const product = products.find(p => p.id.toString() === selectedProductId.toString());
        setSelectedProductDetails(product);
        } else {
        setSelectedProductDetails(null);
        }
    }, [selectedProductId, products]);

    const handleAdd = () => {
        if (selectedProductDetails && quantity > 0) {
        onAddProduct(selectedProductDetails, quantity);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) {
        setQuantity(value);
        } else if (e.target.value === '') {
        setQuantity('');
        }
    };


    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product to Order</DialogTitle>
        <DialogContent >
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                    
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="product-select-label">Product</InputLabel>
                        <Select
                            labelId="product-select-label"
                            value={selectedProductId}
                            label="Product"
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            renderValue={(selectedId) => {
                                if (!selectedId) {
                                    return <em>Select a product</em>;
                                }
                                const product = products.find(p => p.id.toString() === selectedId.toString());
                                return product ? product.name : '';
                            }}
                        >
                            <MenuItem value="">
                                <em>Select a product</em>
                            </MenuItem>
                            {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {product.image_url ? (
                                            <Avatar
                                            src={product.image_url}
                                            alt={product.name}
                                            sx={{ width: 32, height: 32, mr: 2, border: '1px solid lightgray' }}
                                            variant="rounded"
                                            />
                                        ) : (
                                            <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'grey.300' }} variant="rounded">
                                            </Avatar>
                                        )}
                                        <Typography variant="body2">
                                            {product.name} (Price: ${parseFloat(product.unit_price).toFixed(2)})
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField variant="standard" sx={{ height: '1px', mb: -1, overflow:'hidden' }}  />
                </Grid>

                {selectedProductDetails && (
                    <Grid item xs={12} container spacing={2} alignItems="center">
                        <Grid item>
                            {selectedProductDetails.image_url ? (
                            <Avatar
                                src={selectedProductDetails.image_url}
                                alt={selectedProductDetails.name}
                                sx={{ width: 60, height: 60, border: '1px solid lightgray' }}
                                variant="rounded"
                            />
                            ) : (
                            <Avatar sx={{ width: 60, height: 60, bgcolor: 'grey.300' }} variant="rounded" />
                            )}
                        </Grid>
                        <Grid item xs>
                            <Typography variant="subtitle1">{selectedProductDetails.name}</Typography>
                            <Typography variant="body2">Unit Price: ${parseFloat(selectedProductDetails.unit_price).toFixed(2)}</Typography>
                        </Grid>
                    </Grid>
                )}

                <Grid item xs={12} sm={selectedProductDetails ? 6 : 12}>
                    <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    value={quantity}
                    onChange={handleQuantityChange}
                    InputProps={{ inputProps: { min: 1 } }}
                    disabled={!selectedProductId}
                    variant="outlined"
                    />
                </Grid>
                {selectedProductDetails && quantity > 0 && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" align="right">
                            Item Total: ${ (parseFloat(selectedProductDetails.unit_price) * quantity).toFixed(2) }
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
            onClick={handleAdd}
            variant="contained"
            disabled={!selectedProductId || !quantity || quantity <= 0}
            >
            Add to Order
            </Button>
        </DialogActions>
        </Dialog>
    );
}

export default AddProductToOrderModal;