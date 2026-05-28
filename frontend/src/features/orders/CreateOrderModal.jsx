import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useOrders } from '../../contexts/OrderContext';
import { useCustomers } from '../../contexts/CustomerContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';

const CreateOrderModal = ({ isOpen, onClose }) => {
  const { addOrder } = useOrders() || {};
  const { customers = [], updateCustomerStats } = useCustomers() || {};
  const { inventoryItems = [] } = useInventory() || {};
  const { shop } = useAuth() || {};
  const [orderItems, setOrderItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', date: '', variety: '', quantity: '', unit: 'bags', price: '', notes: ''
  });

  const resetOrderForm = () => {
    setFormData({
      customer: '',
      date: '',
      variety: '',
      quantity: '',
      unit: 'bags',
      price: '',
      notes: ''
    });
    setOrderItems([]);
    console.log("Order modal reset");
    console.log("Cart cleared");
    console.log("Fresh modal initialized");
  };

  useEffect(() => {
    resetOrderForm();
  }, [isOpen]);

  const handleClose = () => {
    resetOrderForm();
    onClose();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedProduct = inventoryItems.find(item => item.id === formData.variety);
  const availableStock = selectedProduct ? (Number(selectedProduct.stockQuantity) || Number(selectedProduct.stock) || 0) : 0;
  const isStockInsufficient = selectedProduct && (parseFloat(formData.quantity) || 0) > availableStock;

  const handleAddItem = () => {
    if (!formData.variety || !formData.quantity || !formData.price) {
      alert("Please fill out product name, quantity, and price.");
      return;
    }
    if (isStockInsufficient) {
      alert("Cannot add item: insufficient inventory.");
      return;
    }
    if (orderItems.some(item => item.id === formData.variety)) {
      alert("This product has already been added. Modify or delete the existing entry below.");
      return;
    }

    const qty = parseFloat(formData.quantity) || 0;
    const prc = parseFloat(formData.price) || 0;

    setOrderItems(prev => [...prev, {
      id: selectedProduct.id,
      name: selectedProduct.name,
      quantity: qty,
      price: prc,
      unit: formData.unit,
      total: qty * prc
    }]);

    setFormData(prev => ({ ...prev, variety: '', quantity: '', price: '' }));
  };

  const handleRemoveItem = (idx) => {
    setOrderItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Auto-calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const gst = subtotal * 0.05; 
  const total = subtotal + gst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.customer || formData.customer === "new") {
      alert("Please select a valid customer.");
      return;
    }
    if (orderItems.length === 0) {
      alert("Please add at least one product to the order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        shop_id: shop?.id || localStorage.getItem('shopId'),
        customer_id: formData.customer,
        delivery_date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes,
        items: orderItems.map(i => ({
          product_id: i.id,
          quantity: i.quantity,
          unit: i.unit,
          price_per_unit: i.price,
          tax_percentage: 5
        }))
      };

      await addOrder(payload);
      resetOrderForm();
      onClose();
    } catch (error) {
      console.error("Order creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={handleClose} type="button" disabled={isSubmitting}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} type="button" disabled={isStockInsufficient || isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Order"}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Create New Order" 
      size="lg"
      footer={footer}
    >
      <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
        {/* Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Customer</label>
            <select 
              name="customer" 
              value={formData.customer} 
              onChange={handleChange} 
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Customer...</option>
              {(customers || []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="new">+ Add New Customer (redirect)</option>
            </select>
          </div>
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Delivery Date</label>
            <Input name="date" value={formData.date} onChange={handleChange} type="date" required />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="border-t border-slate-100 my-2 pt-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Product Details</h3>
          
          {/* Third Row - Product Variety */}
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Product Variety</label>
            <select 
              name="variety" 
              value={formData.variety} 
              onChange={handleChange} 
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select Product...</option>
              {(inventoryItems || []).map(item => {
                const stock = Number(item.stockQuantity) || Number(item.stock) || 0;
                const isOutOfStock = stock <= 0;
                const displayLabel = isOutOfStock 
                  ? `${item.name} (Out of Stock)`
                  : `${item.name} (${stock} ${item.unit || ''})`;
                
                return (
                  <option 
                    key={item.id} 
                    value={item.id}
                    disabled={isOutOfStock}
                  >
                    {displayLabel}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Fourth Row - Qty, Unit, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 list-none">
              <label className="text-sm font-medium text-slate-700">Quantity</label>
              <Input name="quantity" type="number" placeholder="0" value={formData.quantity} onChange={handleChange} />
              {isStockInsufficient && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  Only {availableStock} available for this product.
                </p>
              )}
            </div>
            <div className="space-y-1.5 list-none">
              <label className="text-sm font-medium text-slate-700">Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="bags">Bags</option>
                <option value="kg">Kg</option>
                <option value="tons">Tons</option>
                <option value="quintal">Quintal</option>
              </select>
            </div>
            <div className="space-y-1.5 list-none">
              <label className="text-sm font-medium text-slate-700">Price per Unit (₹)</label>
              <Input name="price" type="number" placeholder="0.00" value={formData.price} onChange={handleChange} />
            </div>
          </div>

          {/* Fifth Row - Add button */}
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={handleAddItem}>
              Add Product
            </Button>
          </div>

          {/* Products List Table */}
          {orderItems.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 rounded-xl mt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold">
                    <th className="p-3 border-b">Product</th>
                    <th className="p-3 border-b text-center">Qty</th>
                    <th className="p-3 border-b text-right">Price</th>
                    <th className="p-3 border-b text-right">Total</th>
                    <th className="p-3 border-b text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="p-3 font-medium text-slate-900">{item.name}</td>
                      <td className="p-3 text-center text-slate-600">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-right text-slate-600">₹{item.price.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold text-slate-900">₹{item.total.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notes and Order Summary Row */}
        <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px] resize-none"
              placeholder="Add delivery instructions or special notes..."
            />
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Order Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">GST (5%):</span>
              <span className="font-medium">₹{gst.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-slate-900">Total:</span>
              <span className="font-bold text-primary-600 text-lg">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrderModal;
