import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Store, Calendar, Building2, CreditCard, Clock, AlertCircle, Edit, CheckCircle } from 'lucide-react';
import { useVendors } from '../../contexts/VendorContext';
import { useToast } from '../../contexts/ToastContext';

const VendorCard = ({ vendor, onEdit }) => {
  const { updateVendor } = useVendors() || {};
  const { showToast } = useToast() || {};
  const { 
    id,
    name, 
    recDate,
    receivedDate,
    lastPurchaseDate, 
    deadline, 
    invoiceCost = 0,
    discount = 0,
    totalToPay = 0,
    status,
    createdAt,
    bankDetails
  } = vendor;

  const displayRecDate = createdAt || recDate || receivedDate || lastPurchaseDate;

  // Calculate days remaining
  const today = new Date();
  let diffDays = null;
  let isOverdue = false;
  let isUrgent = false;

  if (deadline) {
    const deadlineDate = new Date(deadline);
    if (!isNaN(deadlineDate.getTime())) {
      const diffTime = Math.abs(deadlineDate - today);
      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isOverdue = deadlineDate < today && status !== 'Paid' && status !== 'paid';
      isUrgent = diffDays <= 3 && status !== 'Paid' && status !== 'paid';
    }
  }

  const formatDate = (date) => {
    if (!date) return "No Date";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "No Date";
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusBadge = () => {
    if (status === 'Paid' || status === 'paid') return <Badge variant="success">Payment Done</Badge>;
    if (isOverdue) return <Badge variant="danger">Overdue</Badge>;
    if (isUrgent) return <Badge variant="warning">Due Soon</Badge>;
    return <Badge variant="primary">Purchase Done</Badge>;
  };

  const handleMarkAsPaid = () => {
    updateVendor(id, { ...vendor, status: 'Paid' });
    showToast(`Invoice for ${name} marked as Paid.`);
  };

  return (
    <Card className={`relative overflow-hidden transition-shadow hover:shadow-md ${isOverdue ? 'border-red-200' : isUrgent ? 'border-amber-200' : ''}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className={`p-2.5 rounded-lg shrink-0 ${status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">{name}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Rec: {formatDate(displayRecDate)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            <button 
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              title="Edit Invoice"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact info from real DB schema */}
        <div className="flex flex-col gap-1 mb-4">
          {vendor.phone && (
            <p className="text-sm text-slate-600 flex items-center gap-1.5"><span className="text-slate-400 font-medium">Phone:</span> {vendor.phone}</p>
          )}
          {vendor.email && (
            <p className="text-sm text-slate-600 flex items-center gap-1.5 line-clamp-1"><span className="text-slate-400 font-medium">Email:</span> <a href={`mailto:${vendor.email}`} className="hover:text-indigo-600 truncate">{vendor.email}</a></p>
          )}
          {vendor.gstNumber && (
            <p className="text-sm text-slate-600 flex items-center gap-1.5"><span className="text-slate-400 font-medium">GST:</span> <span className="font-mono text-xs">{vendor.gstNumber}</span></p>
          )}
        </div>



        {/* Banking Data */}
        {bankDetails && (bankDetails.account || bankDetails.ifsc || bankDetails.branch) && (
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
            <div className="flex items-center text-xs text-slate-500 uppercase tracking-wide font-semibold mb-0.5">
              <Building2 className="w-3.5 h-3.5 mr-1.5" /> Direct Bank Transfer
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm pl-5">
              <div>
                <p className="text-slate-400 text-xs">Acc No.</p>
                <p className="font-mono text-slate-700">{bankDetails.account}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">IFSC</p>
                <p className="font-mono text-slate-700">{bankDetails.ifsc}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-xs">Branch</p>
                <p className="text-slate-600 truncate">{bankDetails.branch}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 mt-4 text-center">
          {status === 'Paid' || status === 'paid' ? (
            <button 
              disabled
              className="w-full py-1.5 rounded-md text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-2 opacity-80 cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" /> Done
            </button>
          ) : (
            <button 
              onClick={handleMarkAsPaid}
              className="w-full py-1.5 rounded-md text-sm font-medium transition-colors text-primary-600 bg-primary-50 hover:bg-primary-100 hover:text-primary-700"
            >
              Mark as Done
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
