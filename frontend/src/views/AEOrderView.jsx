import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Paper, Grid, TextField, Button, CircularProgress, Alert, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

import { getOrderById, createOrder, updateOrder, addOrderItem, updateOrderItem, deleteOrderItem } from '../services/orderService';
import { getAllProducts as fetchAllProducts } from '../services/productService';

import AddProductToOrderModal from '../components/modals/AddProductToOrderModal';
import OrderItemsTable from '../components/OrderItemsTable';
import { useSnackbar } from 'notistack';

function AddEditOrderView() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(orderId);

    const [orderData, setOrderData] = useState({
        order_number: '',
        status: 'Pending',
        creation_date: new Date().toISOString(),
        total_products_count: 0,
        total_final_price: '0.00',
        items: [],
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [openAddProductModal, setOpenAddProductModal] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [isOrderCompleted, setIsOrderCompleted] = useState(false);

    const fetchOrderData = useCallback(async () => {
        if (isEditMode) {
            setLoading(true);
            setError(null);
            try {
                const response = await getOrderById(orderId);
                setOrderData({
                ...response.data,
                order_number: response.data.order_number || '',
                status: response.data.status || 'Pending',
                creation_date: response.data.creation_date || new Date().toISOString(),
                total_products_count: response.data.total_products_count || 0,
                total_final_price: response.data.total_final_price || '0.00',
                items: response.data.items || [],
                });
                setIsOrderCompleted(response.data.status === 'Completed');
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError(err.message || "Failed to load order data.");
            } finally {
                setLoading(false);
            }
        } else {
            setOrderData({
                order_number: '',
                status: 'Pending',
                creation_date: new Date().toISOString(),
                total_products_count: 0,
                total_final_price: '0.00',
                items: [],
            });
            setIsOrderCompleted(false);
        }
    }, [orderId, isEditMode]);

    const fetchProductsList = useCallback(async () => {
        try {
            const response = await fetchAllProducts();
            setProducts(response.data);
        } catch (err) {
            console.error("Failed to fetch products list:", err);
        }
    }, []);

    useEffect(() => {
        fetchOrderData();
        fetchProductsList();
    }, [fetchOrderData, fetchProductsList]);

    useEffect(() => {
        if (!isEditMode) {
            const newTotalProductsCount = orderData.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            const newTotalFinalPrice = orderData.items.reduce((sum, item) => {
                const itemPrice = item.item_total ? parseFloat(item.item_total) :
                    (item.product && item.product.unit_price ? parseFloat(item.product.unit_price) * Number(item.quantity || 0) : 0);
                return sum + itemPrice;
            }, 0);

            setOrderData(prev => ({
                ...prev,
                total_products_count: newTotalProductsCount,
                total_final_price: newTotalFinalPrice.toFixed(2),
            }));
        }
    }, [orderData.items, isEditMode]);

    const handleInputChange = (event) => {
        if(isOrderCompleted) return;
        const { name, value } = event.target;
        setOrderData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isOrderCompleted) {
            enqueueSnackbar("Cannot modify a completed order.", { variant: 'warning' });
            return;
        }
        setSaving(true);
        setError(null);


        try {
            let savedOrder;
            if (isEditMode) {
                savedOrder = await updateOrder(orderId, { status: orderData.status });
                enqueueSnackbar(`Order #${savedOrder.order_number} updated successfully!`, { variant: 'success' });
            } else {
                const createdOrderResponse = await createOrder({ status: orderData.status });
                const newOrderId = createdOrderResponse.data.id;

                for (const item of orderData.items) {
                await addOrderItem({
                    order: newOrderId,
                    product: item.product_id || item.product.id,
                    quantity: item.quantity,
                });
                }

                const finalOrderResponse = await getOrderById(newOrderId);
                savedOrder = finalOrderResponse;
                enqueueSnackbar(`Order #${savedOrder.order_number} created successfully!`, { variant: 'success' });
            }
            console.log("Order saved:", savedOrder.data);
            navigate('/my-orders');
        } catch (err) {
            console.error("Failed to save order:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Failed to save order.";
            enqueueSnackbar(errorMessage, { variant: 'error' });
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenAddProductModal = () => {
        if(isOrderCompleted) return;
        setOpenAddProductModal(true);
    }
    const handleCloseAddProductModal = () => setOpenAddProductModal(false);

    const handleAddProductToOrder = async (productToAdd, quantity) => {

        const existingItemIndex = orderData.items.findIndex(
            (item) => (item.product_id || item.product?.id) === productToAdd.id
        );

        if (isEditMode && orderId) {
            try {
                setSaving(true);
                if (existingItemIndex > -1) {
                    const existingItem = orderData.items[existingItemIndex];
                    const newQuantity = existingItem.quantity + Number(quantity);
                    await updateOrderItem(existingItem.id, { quantity: newQuantity });
                    enqueueSnackbar(`Quantity for ${productToAdd.name} updated!`, { variant: 'info' });
                } else {
                    await addOrderItem({
                        order: parseInt(orderId),
                        product: productToAdd.id,
                        quantity: Number(quantity),
                    });
                    enqueueSnackbar(`${productToAdd.name} added to order!`, { variant: 'info' });
                }
                await fetchOrderData();
                setSaving(false);
            } catch (err) {
                console.error("Failed to process item for existing order", err);
                enqueueSnackbar(`Failed to process ${productToAdd.name}.`, { variant: 'error' });
                setError(err.message || "Failed to process product.");
                setSaving(false);
            }
        } else {
            if (existingItemIndex > -1) {
                setOrderData(prev => ({
                    ...prev,
                    items: prev.items.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + Number(quantity), item_total: (parseFloat(item.product.unit_price) * (item.quantity + Number(quantity))).toFixed(2) }
                            : item
                    ),
                }));
                enqueueSnackbar(`Quantity for ${productToAdd.name} updated in draft.`, { variant: 'info' });
            } else {
                const newItemForState = {
                    product: productToAdd,
                    product_id: productToAdd.id,
                    product_name: productToAdd.name,
                    quantity: Number(quantity),
                    unit_price_at_order: parseFloat(productToAdd.unit_price),
                    item_total: (parseFloat(productToAdd.unit_price) * Number(quantity)).toFixed(2),
                };
                setOrderData(prev => ({
                    ...prev,
                    items: [...prev.items, newItemForState],
                }));
                enqueueSnackbar(`${productToAdd.name} added to current order draft.`, { variant: 'info' });
            }
        }
        handleCloseAddProductModal();
    };

    const handleRemoveItemFromOrder = async (itemIndexToRemove) => {
        const itemToRemove = orderData.items[itemIndexToRemove];

        if (isEditMode && itemToRemove.id) {
        try {
            setSaving(true);
            await deleteOrderItem(itemToRemove.id);
            await fetchOrderData();
            setSaving(false);
        } catch (err) {
            console.error("Failed to delete item from order", err);
            setError(err.message || "Failed to remove product.");
            setSaving(false);
        }
        } else {
            setOrderData(prev => ({
                ...prev,
                items: prev.items.filter((_, index) => index !== itemIndexToRemove),
            }));
        }
    };

    const handleEditItemInOrder = async (itemIndexToEdit, newQuantity) => {
        const itemToEdit = orderData.items[itemIndexToEdit];

        if (isEditMode && itemToEdit.id) {
        try {
            setSaving(true);
            await updateOrderItem(itemToEdit.id, { quantity: Number(newQuantity) });
            await fetchOrderData();
            setSaving(false);
        } catch (err) {
            console.error("Failed to update item quantity", err);
            setError(err.message || "Failed to update quantity.");
            setSaving(false);
        }
        } else {
            setOrderData(prev => ({
                ...prev,
                items: prev.items.map((item, index) =>
                index === itemIndexToEdit
                    ? {
                        ...item,
                        quantity: Number(newQuantity),
                        item_total: (parseFloat(item.product?.unit_price || item.unit_price_at_order) * Number(newQuantity)).toFixed(2),
                    }
                    : item
                ),
            }));
        }
    };


  if (loading && isEditMode) return <CircularProgress />;
  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
            {isEditMode ? `Edit Order #${orderData.order_number || orderId}` : 'Add New Order'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <TextField
                    label="Order #"
                    fullWidth
                    value={orderData.order_number}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                    label="Date"
                    fullWidth
                    value={new Date(orderData.creation_date).toLocaleDateString()}
                    InputProps={{ readOnly: true }} // Autocompletado
                    variant="filled"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth disabled={isOrderCompleted} variant="outlined">
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                        labelId="status-select-label"
                        id="status-select"
                        name="status"
                        value={orderData.status}
                        label="Status"
                        onChange={handleInputChange}
                    >
                        {isOrderCompleted ? (
                            <MenuItem key="completed-only" value="Completed">Completed</MenuItem>
                        ) : [ // Devolver un array de MenuItems
                            <MenuItem key="pending" value="Pending">Pending</MenuItem>,
                            <MenuItem key="inProgress" value="InProgress">In Progress</MenuItem>,
                            <MenuItem key="completed" value="Completed">Completed</MenuItem>
                        ]}
                    </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Order Items</Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddShoppingCartIcon />}
                            onClick={handleOpenAddProductModal}
                            disabled={isOrderCompleted}
                        >
                            Add Product to Order
                        </Button>
                    </Box>
                    {orderData.items.length === 0 ? (
                        <Typography sx={{ml:1, fontStyle: 'italic'}}>No products added to this order yet.</Typography>
                    ) : (
                        <OrderItemsTable
                            items={orderData.items}
                            onRemoveItem={handleRemoveItemFromOrder}
                            onEditItemQuantity={handleEditItemInOrder}
                            disabled={isOrderCompleted}
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                    label="# Products in Order"
                    fullWidth
                    value={orderData.total_products_count}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                    label="Final Price"
                    fullWidth
                    value={`$${parseFloat(orderData.total_final_price).toFixed(2)}`}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    />
                </Grid>
            </Grid>

            <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={saving || isOrderCompleted}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
            {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Order')}
            </Button>
        </Box>

        <AddProductToOrderModal
            open={openAddProductModal}
            onClose={handleCloseAddProductModal}
            products={products}
            onAddProduct={handleAddProductToOrder}
        />
    </Paper>
  );
}

export default AddEditOrderView;