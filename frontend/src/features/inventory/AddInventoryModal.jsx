import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useInventory } from '../../contexts/InventoryContext';
import { useToast } from '../../contexts/ToastContext';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import vendorService from '../../services/vendorService';

const AddInventoryModal = ({ isOpen, onClose, editingItem }) => {
  const { addInventoryItem, updateInventoryItem } = useInventory() || {};
  const { showToast } = useToast() || {};
  
  const [formData, setFormData] = useState({
    name: '', variety: '', grade: '', vendorName: '', stock: '', unitId: '', purchasePrice: '', sellingPrice: ''
  });
  
  const [vendors, setVendors] = useState([]);
  const [units, setUnits] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Load vendors and units when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const shopId = localStorage.getItem('shopId');
        
        // Fetch vendors
        const vendorsList = await vendorService.getAllVendors(shopId);
        if (active) setVendors(vendorsList || []);

        // Fetch units
        const { data: unitsList } = await api.get('/products/units');
        console.log("Fetched units:", unitsList);
        if (active) setUnits(unitsList || []);
      } catch (err) {
        console.error("Failed to load vendors/units:", err);
      } finally {
        if (active) setIsLoadingOptions(false);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        variety: editingItem.variety || '',
        grade: editingItem.grade || '',
        vendorName: editingItem.supplier || '',
        stock: editingItem.stock ?? editingItem.stockQuantity ?? 0,
        unitId: editingItem.unitId || '',
        purchasePrice: editingItem.purchasePrice || '',
        sellingPrice: editingItem.sellingPrice || ''
      });
    } else {
      setFormData({ name: '', variety: '', grade: '', vendorName: '', stock: '', unitId: '', purchasePrice: '', sellingPrice: '' });
    }
  }, [editingItem, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || isSubmitting) return;
    
    console.log("Selected unit ID in form:", formData.unitId);
    
    setIsSubmitting(true);
    try {
      const itemData = {
        name: formData.name,
        variety: formData.variety || 'General',
        grade: formData.grade || 'Standard',
        supplier: formData.vendorName || null,
        unitId: formData.unitId || null,
        stock: Number(formData.stock) || 0,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        lastUpdated: new Date().toISOString()
      };

      console.log("Submitting final payload from modal:", itemData);

      if (editingItem) {
        await updateInventoryItem(editingItem.id, itemData);
        showToast('Product updated successfully');
      } else {
        await addInventoryItem(itemData);
        showToast('New product added successfully');
      }
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} type="button" disabled={isSubmitting}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} type="button" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Product')}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingItem ? 'Edit Product' : 'Add New Product'} 
      size="lg"
      footer={footer}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Product Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Electronics Premium" required />
          </div>
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Supplier / Vendor</label>
            <select
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Stock Quantity</label>
            <Input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="0" />
          </div>
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Unit</label>
            <select
              name="unitId"
              value={formData.unitId}
              onChange={handleChange}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Unit</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.symbol ? `${u.unit_name} (${u.symbol})` : u.unit_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Purchase Price (₹)</label>
            <Input name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} placeholder="0.00" />
          </div>
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Selling Price (₹)</label>
            <Input name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleChange} placeholder="0.00" />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddInventoryModal;
