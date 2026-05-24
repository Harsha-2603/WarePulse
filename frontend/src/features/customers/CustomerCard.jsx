import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Mail, Phone, MapPin, Calendar, ShoppingCart, DollarSign } from 'lucide-react';

const CustomerCard = ({ customer, onEdit }) => {
  const { 
    name, 
    email, 
    phone, 
    address, 
    city,
    state,
    pinCode,
    gstNumber, 
    joinDate,
    total_orders,
    total_spent
  } = customer;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Smooth top border hover effect */}
      <div className="absolute top-0 left-0 h-1 bg-blue-500 w-0 group-hover:w-full transition-all duration-300 ease-in-out z-10" />
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">{name}</h3>
              {gstNumber && (
                <p className="text-xs text-slate-500 font-mono mt-0.5">GST: {gstNumber}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onEdit}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Edit
          </button>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-2.5">
          {phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center text-sm text-slate-600 overflow-hidden line-clamp-1">
              <Mail className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-indigo-600 truncate">{email}</a>
            </div>
          )}
          {address && (
            <div className="flex items-start text-sm text-slate-600">
              <MapPin className="w-4 h-4 mr-2.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{address}</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5"/> Total Orders</p>
            <p className="text-base font-bold text-slate-900">{total_orders}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5"/> Total Spent</p>
            <p className="text-base font-bold text-slate-900">₹{Number(total_spent || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          Customer since {new Date(joinDate || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric'})}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
