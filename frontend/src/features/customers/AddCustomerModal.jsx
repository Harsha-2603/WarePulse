import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useCustomers } from '../../contexts/CustomerContext';

const AddCustomerModal = ({ isOpen, onClose, editingCustomer }) => {
  const { addCustomer, updateCustomer } = useCustomers() || {};
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pinCode: '', gstNumber: ''
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name || '',
        email: editingCustomer.email || '',
        phone: editingCustomer.phone || '',
        address: editingCustomer.address || '',
        city: editingCustomer.city || '',
        state: editingCustomer.state || '',
        pinCode: editingCustomer.pinCode || '',
        gstNumber: editingCustomer.gstNumber || ''
      });
    } else {
      setFormData({ name: '', email: '', phone: '', address: '', city: '', state: '', pinCode: '', gstNumber: '' });
    }
  }, [editingCustomer, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const fullAddress = [formData.address, formData.city, formData.state, formData.pinCode].filter(Boolean).join(", ");
      
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: fullAddress,
        gstNumber: formData.gstNumber
      };

      console.log("Final Customer Payload:", payload);

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          ...editingCustomer,
          ...payload
        });
      } else {
        await addCustomer({
          ...payload,
          joinDate: new Date().toISOString().split('T')[0],
          totalOrders: 0,
          totalPurchase: 0
        });
      }
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} type="button" disabled={isSubmitting}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} type="button" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (editingCustomer ? 'Save Changes' : 'Add Customer')}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingCustomer ? 'Edit Customer' : 'Add New Customer'} 
      size="md"
      footer={footer}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5 list-none">
          <label className="text-sm font-medium text-slate-700">Customer Name</label>
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ramesh Supermarket" required />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="contact@rameshsm.com" />
          </div>
          <div className="space-y-1.5 list-none">
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <Input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+91 9999999999" required />
          </div>
        </div>

        <div className="space-y-1.5 list-none border-t border-slate-100 pt-4 mt-2">
          <label className="text-sm font-medium text-slate-700">Street Address</label>
          <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main Market Rd" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 list-none sm:col-span-1">
            <label className="text-sm font-medium text-slate-700">City</label>
            <Input name="city" value={formData.city} onChange={handleChange} placeholder="Hyderabad" />
          </div>
          <div className="space-y-1.5 list-none sm:col-span-1">
            <label className="text-sm font-medium text-slate-700">State</label>
            <Input name="state" value={formData.state} onChange={handleChange} placeholder="Telangana" />
          </div>
          <div className="space-y-1.5 list-none sm:col-span-1">
            <label className="text-sm font-medium text-slate-700">PIN Code</label>
            <Input name="pinCode" value={formData.pinCode} onChange={handleChange} placeholder="500001" />
          </div>
        </div>

        <div className="space-y-1.5 list-none border-t border-slate-100 pt-4 mt-2">
          <label className="text-sm font-medium text-slate-700">GST Number</label>
          <Input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="e.g. 36AABCT1234D1Z5" className="uppercase font-mono text-sm" />
        </div>
      </form>
    </Modal>
  );
};

export default AddCustomerModal;
