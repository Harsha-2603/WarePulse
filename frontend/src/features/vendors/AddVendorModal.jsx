import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useVendors } from '../../contexts/VendorContext';
import { useToast } from '../../contexts/ToastContext';

const AddVendorModal = ({ isOpen, onClose, editingVendor }) => {
  const { addVendor, updateVendor, refreshVendors } = useVendors() || {};
  const { showToast } = useToast() || {};
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', gstNumber: '',
    account: '', ifsc: '', branch: ''
  });

  useEffect(() => {
    if (editingVendor) {
      setFormData({
        name: editingVendor.name || '',
        phone: editingVendor.phone || '',
        email: editingVendor.email || '',
        gstNumber: editingVendor.gstNumber || '',
        account: editingVendor.bankDetails?.account || '',
        ifsc: editingVendor.bankDetails?.ifsc || '',
        branch: editingVendor.bankDetails?.branch || ''
      });
    } else {
      setFormData({
        name: '', phone: '', email: '', gstNumber: '',
        account: '', ifsc: '', branch: ''
      });
    }
  }, [editingVendor, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      showToast('Vendor Name is required.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          gstNumber: formData.gstNumber,
          bankDetails: { account: formData.account, ifsc: formData.ifsc, branch: formData.branch }
        });
      } else {
        const vendorPayload = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          gstNumber: formData.gstNumber,
          bankDetails: { account: formData.account, ifsc: formData.ifsc, branch: formData.branch }
        };
        console.log("VENDOR PAYLOAD", vendorPayload);
        
        // 1. Create Vendor 
        const newVendor = await addVendor(vendorPayload);
      }

      // 2. Refresh vendor list immediately
      if (typeof refreshVendors === 'function') {
        await refreshVendors();
      }
      
      // 3. Close modal
      onClose();

    } catch (error) {
      console.error("SUBMISSION ERROR", error);
      showToast(error.message || 'An error occurred during submission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} type="button" disabled={isSubmitting}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} type="button" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : (editingVendor ? 'Save Changes' : 'Create Vendor')}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingVendor ? 'Edit Details' : 'Add Record'} 
      size="md"
      footer={footer}
    >
      <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-1.5 list-none">
             <label className="text-sm font-medium text-slate-700">Vendor Name</label>
             <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Global Tech Suppliers" required />
           </div>
           <div className="space-y-1.5 list-none">
             <label className="text-sm font-medium text-slate-700">GST Number</label>
             <Input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="e.g. 29ABCDE1234F1Z5" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-1.5 list-none">
             <label className="text-sm font-medium text-slate-700">Phone Number</label>
             <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 9876543210" />
           </div>
           <div className="space-y-1.5 list-none">
             <label className="text-sm font-medium text-slate-700">Email Address</label>
             <Input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="e.g. supplier@company.com" />
           </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-2">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Bank Transfer Details</h4>
          <div className="space-y-4">
            <div className="space-y-1.5 list-none">
              <label className="text-sm font-medium text-slate-700">Account Number</label>
              <Input name="account" value={formData.account} onChange={handleChange} placeholder="e.g. 50100234567891" className="font-mono text-sm tracking-widest" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 list-none">
                <label className="text-sm font-medium text-slate-700">IFSC Code</label>
                <Input name="ifsc" value={formData.ifsc} onChange={handleChange} placeholder="HDFC0001234" className="uppercase font-mono text-sm" />
              </div>
              <div className="space-y-1.5 list-none">
                <label className="text-sm font-medium text-slate-700">Bank Branch</label>
                <Input name="branch" value={formData.branch} onChange={handleChange} placeholder="Banjara Hills, Hyd" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddVendorModal;
