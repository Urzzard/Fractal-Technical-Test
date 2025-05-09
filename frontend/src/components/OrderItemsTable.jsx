import React, {useState} from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, TextField, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ConfirmationModal from './modals/ConfirmationModal';


function OrderItemsTable({ items, onRemoveItem, onEditItemQuantity, disabled }) {
    const [editModeRowIndex, setEditModeRowIndex] = React.useState(null);
    const [editableQuantity, setEditableQuantity] = React.useState('');
    const [openDeleteItemModal, setOpenDeleteItemModal] = useState(false);
    const [itemIndexToDelete, setItemIndexToDelete] = useState(null);

    const handleEditClick = (item, index) => {
        setEditModeRowIndex(index);
        setEditableQuantity(item.quantity.toString());
    };

    const handleSaveClick = (index) => {
        const newQuantity = parseInt(editableQuantity, 10);
        if (!isNaN(newQuantity) && newQuantity > 0) {
        onEditItemQuantity(index, newQuantity);
        }
        setEditModeRowIndex(null);
        setEditableQuantity('');
    };

    const handleCancelClick = () => {
        setEditModeRowIndex(null);
        setEditableQuantity('');
    };

    const handleDeleteItemClick = (index) => {
        setItemIndexToDelete(index);
        setOpenDeleteItemModal(true);
      };
    
      const handleCloseDeleteItemModal = () => {
        setOpenDeleteItemModal(false);
        setItemIndexToDelete(null);
      };
    
      const handleConfirmDeleteItem = () => {
        if (itemIndexToDelete !== null) {
          onRemoveItem(itemIndexToDelete);
        }
        handleCloseDeleteItemModal();
      };

    if (!items || items.length === 0) {
        return <Typography sx={{ml:1, mt: 2, fontStyle: 'italic'}}>No products added to this order yet.</Typography>;
    }

    const itemToDeleteDetails = itemIndexToDelete !== null && items[itemIndexToDelete] ? items[itemIndexToDelete] : null;

    return (
        <>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="order items table">
                    <TableHead>
                        <TableRow sx={(theme) =>({ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200] })}>
                            <TableCell> ID </TableCell>
                            <TableCell>Product Name</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="center">Quantity</TableCell>
                            <TableCell align="right">Item Total</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={item.product_id || item.product?.id || index}>
                            <TableCell component="th" scope='row'>
                                {item.product?.id}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {item.product_name || item.product?.name}
                            </TableCell>
                            <TableCell align="right">
                                ${parseFloat(item.unit_price_at_order || item.product?.unit_price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                                {editModeRowIndex === index && !disabled ? (
                                    <TextField
                                        type="number"
                                        value={editableQuantity}
                                        onChange={(e) => setEditableQuantity(e.target.value)}
                                        size="small"
                                        InputProps={{ inputProps: { min: 1 } }}
                                        sx={{ width: '80px' }}
                                        autoFocus
                                    />
                                    ) : (
                                    item.quantity
                                )}
                            </TableCell>
                            <TableCell align="right">
                                ${parseFloat(item.item_total || 0).toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                                {editModeRowIndex === index ? (
                                <Box>
                                    <IconButton color="primary" size="small" onClick={() => handleSaveClick(index)}>
                                    <SaveIcon fontSize="small"/>
                                    </IconButton>
                                    <IconButton color="default" size="small" onClick={handleCancelClick}>
                                    <CancelIcon fontSize="small"/>
                                    </IconButton>
                                </Box>
                                ) : (
                                <IconButton
                                    color="primary"
                                    size="small"
                                    aria-label="edit item"
                                    onClick={() => handleEditClick(item, index)}
                                    disabled={disabled}
                                >
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                                )}
                                <IconButton
                                color="error"
                                size="small"
                                aria-label="delete item"
                                onClick={() => handleDeleteItemClick(index)}
                                disabled={disabled}
                                >
                                <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <ConfirmationModal
                open={openDeleteItemModal}
                onClose={handleCloseDeleteItemModal}
                onConfirm={handleConfirmDeleteItem}
                title="Confirm Remove Product"
                message={`Are you sure you want to remove "${itemToDeleteDetails?.product_name || itemToDeleteDetails?.product?.name || 'this product'}" from the order?`}
            />
        </>    
    );
}

export default OrderItemsTable;