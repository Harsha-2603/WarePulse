import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useInventory } from '../../contexts/InventoryContext';
import { useToast } from '../../contexts/ToastContext';
import Input from '../../components/ui/Input';

const AddInventoryModal = ({ isOpen, onClose, editingItem }) => {
  const { addInventoryItem, updateInventoryItem } = useInventory() || {};
  const { showToast } = useToast() || {};
  const [formData, setFormData] = useState({
    name: '', variety: '', grade: '', supplier: '', stock: '', unit: 'kg', purchasePrice: '', sellingPrice: ''
  });
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomUnit, setShowCustomUnit] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        variety: editingItem.variety,
        grade: editingItem.grade,
        supplier: editingItem.supplier,
        stock: editingItem.stock ?? editingItem.stockQuantity ?? 0,
        unit: editingItem.unit,
        purchasePrice: editingItem.purchasePrice,
        sellingPrice: editingItem.sellingPrice
      });
      // Check if unit is in predefined list
      const predefined = ['kg', 'quintal', 'tons', 'bags_25kg', 'bags_50kg', 'Unit'];
      if (!predefined.includes(editingItem.unit)) {
        setShowCustomUnit(true);
        setCustomUnit(editingItem.unit);
        setFormData(prev => ({ ...prev, unit: 'other' }));
      }
    } else {
      setFormData({ name: '', variety: '', grade: '', supplier: '', stock: '', unit: 'kg', purchasePrice: '', sellingPrice: '' });
      setShowCustomUnit(false);
      setCustomUnit('');
    }
  }, [editingItem, isOpen]);

  const handleChange = (e) => {
    if (e.target.name === 'unit' && e.target.value === 'other') {
      setShowCustomUnit(true);
    } else if (e.target.name === 'unit') {
      setShowCustomUnit(false);
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const finalUnit = formData.unit === 'other' ? customUnit : formData.unit;
      const itemData = {
        ...formData,
        shop_id: editingItem?.shop_id,
        unit: finalUnit,
        stock: Number(formData.stock) || 0,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        lastUpdated: new Date().toISOString()
      };

      if (editingItem) {
        await updateInventoryItem(editingItem.id, itemData);
        showToast('Product category updated successfully');
      } else {
        await addInventoryItem(itemData);
        showToast('New product category added successfully');
      }
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
      showToast(err.message || 'Failed to save product category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} type="button" disabled={isSubmitting}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} type="button" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Product Category')}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingItem ? 'Edit Product Category' : 'Add New Product Category'} 
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
            <label className="text-sm font-medium text-slate-700">Supplier</label>
            <Input name="supplier" value={formData.supplier} onChange={handleChange} placeholder="e.g. Andhra Rice Co." />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Stock Quantity</label>
            <Input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="0" />
          </div>
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Unit</label>
            <select name="unit" value={formData.unit} onChange={handleChange} className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="Unit">Unit/Piece</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="quintal">Quintal</option>
              <option value="tons">Tons</option>
              <option value="bags_25kg">Bags (25kg)</option>
              <option value="bags_50kg">Bags (50kg)</option>
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
