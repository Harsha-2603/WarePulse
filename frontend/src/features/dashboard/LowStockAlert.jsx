import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { AlertTriangle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { Link } from 'react-router-dom';

const LowStockAlert = () => {
  const { inventoryItems = [] } = useInventory() || {};
  
  const lowStockThreshold = 15;
  const lowStockItems = Array.isArray(inventoryItems) ? inventoryItems.filter(item => (item.stock || 0) < lowStockThreshold) : [];

  return (
    <Card className="h-full border-red-200">
      <CardHeader className="bg-red-50/50 flex flex-row items-center justify-between py-5 border-red-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <CardTitle className="text-red-900">Low Stock Alerts</CardTitle>
        </div>
        <Badge variant="danger">{lowStockItems.length} Items</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
          {lowStockItems.length > 0 ? (
            lowStockItems.map((item) => (
              <div key={item.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.name} {item.unit ? `- ${item.unit}` : ''}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">{item.category || 'General'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-red-600">{item.stock} left</span>
                    <p className="text-xs text-slate-500 mt-1">Min: {lowStockThreshold}</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (item.stock / lowStockThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-500 font-medium font-sans">All stock levels are optimal.</p>
            </div>
          )}
        </div>
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50 text-center">
          <Link to="/inventory" className="text-sm font-medium text-primary-600 hover:text-primary-700">Manage Inventory</Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
