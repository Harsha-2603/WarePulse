import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Package, TrendingUp, AlertTriangle, Clock, Edit, Trash2 } from 'lucide-react';

const InventoryCard = ({ item, onEdit, onDelete }) => {
  const product = item;
  console.log("Fetched product data:", product);
  console.log("Stock unit:", product.unit_name || product.unit);
  console.log("Rendered stock:", `${product.stockQuantity} ${product.unit_name || product.unit}`);

  const { 
    name, 
    variety, 
    grade, 
    unit, 
    purchasePrice, 
    sellingPrice, 
    supplier, 
    lastUpdated,
    minStockLevel
  } = item;

  const stockQuantity = item.stock ?? item.stockQuantity ?? 0;

  const profitMargin = (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(1);
  const isLowStock = stockQuantity <= minStockLevel;

  const getStockStatus = () => {
    if (stockQuantity > 50) return { label: 'Good', variant: 'success' };
    if (stockQuantity >= 20 && stockQuantity <= 50) return { label: 'Average', variant: 'warning' };
    return { label: 'Bad', variant: 'danger' };
  };
  const stockStatus = getStockStatus();

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${isLowStock ? 'border-red-200' : ''}`}>
      {/* Top Color Accent */}
      <div className={`h-1.5 w-full ${isLowStock ? 'bg-red-500' : 'bg-primary-500'}`} />
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={name}>{name}</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Supplier: {supplier || 'N/A'}</p>
            <div className="mt-1.5">
              <Badge variant={stockStatus.variant}>
                {stockStatus.label}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              <button 
                onClick={onEdit}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="Edit Product"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  console.log("Delete clicked for product:", product.id);
                  onDelete && onDelete();
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2 my-5">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Stock</p>
            <div className="flex items-center gap-1.5">
              {isLowStock ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <Package className="w-4 h-4 text-primary-500" />
              )}
              <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                {stockQuantity} <span className="text-sm font-normal text-slate-500">{product.unit_name || product.unit || ""}</span>
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Margin</p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-slate-900">{profitMargin}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Purchase (₹)</p>
            <p className="font-semibold text-slate-700">₹{purchasePrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Selling (₹)</p>
            <p className="font-semibold text-primary-700">₹{sellingPrice.toLocaleString()}</p>
          </div>
        </div>

        {lastUpdated && (
          <div className="mt-3 flex justify-end">
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-end">
          <button 
            onClick={onEdit}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Edit Details
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryCard;
