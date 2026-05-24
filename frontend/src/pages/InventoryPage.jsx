import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import InventoryCard from '../features/inventory/InventoryCard';
import AddInventoryModal from '../features/inventory/AddInventoryModal';
import { useInventory } from '../contexts/InventoryContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CSVFormatModal from '../components/modals/CSVFormatModal';
import Modal from '../components/ui/Modal';
import { Info } from 'lucide-react';
import productService from '../services/productService';

const InventoryPage = () => {
  const { inventoryItems = [], addInventoryItem, deleteInventoryItem, refreshInventory, isLoading } = useInventory() || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('stock_desc');

  const handleExportCSV = () => {
    if (inventoryItems.length === 0) return;
    
    const headers = ['product_name', 'supplier', 'stock_quantity', 'unit', 'purchase_price', 'selling_price'];
    const rows = filteredItems.map(item => [
      `"${String(item.name || '').replace(/"/g, '""')}"`,
      `"${String(item.supplier || '').replace(/"/g, '""')}"`,
      item.stock ?? 0,
      `"${String(item.unit || '').replace(/"/g, '""')}"`,
      item.purchasePrice ?? 0,
      item.sellingPrice ?? 0
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("The CSV file is empty or missing data.");
        return;
      }

      // Helper to strip quotes
      const cleanVal = (val) => {
        if (!val) return '';
        let cleaned = val.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        }
        return cleaned;
      };

      const headers = lines[0].toLowerCase().split(',').map(h => cleanVal(h));
      const required = ['product_name', 'stock_quantity', 'unit', 'purchase_price', 'selling_price'];
      const missing = required.filter(field => !headers.includes(field));

      if (missing.length > 0) {
        alert(`Rejected: Missing required columns: ${missing.join(', ')}`);
        return;
      }

      const nameIdx = headers.indexOf('product_name');
      const supplierIdx = headers.indexOf('supplier');
      const stockIdx = headers.indexOf('stock_quantity');
      const unitIdx = headers.indexOf('unit');
      const purchasePriceIdx = headers.indexOf('purchase_price');
      const sellingPriceIdx = headers.indexOf('selling_price');

      let addedCount = 0;
      const errorSummary = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => cleanVal(v));
        if (values.length < headers.length) {
          errorSummary.push(`Row ${i + 1}: Incomplete row fields`);
          continue;
        }

        const nameVal = values[nameIdx];
        const supplierVal = supplierIdx !== -1 ? values[supplierIdx] : '';
        const stockStr = values[stockIdx];
        const unitVal = values[unitIdx];
        const purchaseStr = values[purchasePriceIdx];
        const sellingStr = values[sellingPriceIdx];

        // Validation
        if (!nameVal) {
          errorSummary.push(`Row ${i + 1}: product_name is empty`);
          continue;
        }
        if (stockStr === '') {
          errorSummary.push(`Row ${i + 1}: stock_quantity is empty`);
          continue;
        }
        if (!unitVal) {
          errorSummary.push(`Row ${i + 1}: unit is empty`);
          continue;
        }
        if (purchaseStr === '') {
          errorSummary.push(`Row ${i + 1}: purchase_price is empty`);
          continue;
        }
        if (sellingStr === '') {
          errorSummary.push(`Row ${i + 1}: selling_price is empty`);
          continue;
        }

        const stock = Number(stockStr);
        const purchasePrice = Number(purchaseStr);
        const sellingPrice = Number(sellingStr);

        if (isNaN(stock) || stock < 0) {
          errorSummary.push(`Row ${i + 1}: stock_quantity must be a valid number >= 0`);
          continue;
        }
        if (isNaN(purchasePrice) || purchasePrice < 0) {
          errorSummary.push(`Row ${i + 1}: purchase_price must be a valid number >= 0`);
          continue;
        }
        if (isNaN(sellingPrice) || sellingPrice < 0) {
          errorSummary.push(`Row ${i + 1}: selling_price must be a valid number >= 0`);
          continue;
        }

        const newItem = {
          name: nameVal,
          supplier: supplierVal,
          stock: stock,
          unit: unitVal,
          purchasePrice: purchasePrice,
          sellingPrice: sellingPrice,
          variety: 'General',
          grade: 'Standard',
          lastUpdated: new Date().toISOString()
        };

        try {
          await productService.createProduct(newItem);
          addedCount++;
        } catch (err) {
          const errMsg = err.message || 'Failed to create product';
          errorSummary.push(`Row ${i + 1} (${nameVal}): ${errMsg}`);
        }
      }

      if (addedCount > 0 && typeof refreshInventory === 'function') {
        await refreshInventory();
      }

      if (errorSummary.length > 0) {
        alert(`Import finished:\n- Successfully imported: ${addedCount}\n- Failed: ${errorSummary.length}\n\nErrors:\n${errorSummary.join('\n')}`);
      } else {
        alert(`Successfully imported all ${addedCount} products.`);
      }

      e.target.value = null; // Reset input
    };
    reader.readAsText(file);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const safeItems = Array.isArray(inventoryItems) ? inventoryItems : [];
  const filteredItems = safeItems.filter(item => {
    if (!item) return false;
    const search = (searchQuery || '').toLowerCase();
    if (!search) return true;

    return (
      (item?.name || '').toLowerCase().includes(search) ||
      (item?.variety || '').toLowerCase().includes(search) ||
      (item?.supplier || '').toLowerCase().includes(search) ||
      (item?.category || '').toLowerCase().includes(search) ||
      (item?.unit || '').toLowerCase().includes(search)
    );
  }).sort((a, b) => {
    if (sortOption === 'stock_desc') return (b?.stock || 0) - (a?.stock || 0);
    if (sortOption === 'stock_asc') return (a?.stock || 0) - (b?.stock || 0);
    if (sortOption === 'margin_desc') {
      const priceA = Number(a?.sellingPrice) || 0;
      const priceB = Number(b?.sellingPrice) || 0;
      const marginA = priceA > 0 ? (priceA - (Number(a?.purchasePrice) || 0)) / priceA : 0;
      const marginB = priceB > 0 ? (priceB - (Number(b?.purchasePrice) || 0)) / priceB : 0;
      return marginB - marginA;
    }
    return 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="mt-1 text-slate-500">View and manage your product stock, pricing, and suppliers.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="csvImport"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleImportCSV(e)}
          />
          <div className="flex items-center">
            <Button 
              variant="outline" 
              className="hidden sm:flex rounded-r-none border-r-0"
              onClick={() => document.getElementById('csvImport').click()}
            >
              Import CSV
            </Button>
            <Button
              variant="outline"
              className="hidden sm:flex rounded-l-none px-2 text-slate-400 hover:text-indigo-600 border-l-[1px]"
              onClick={() => setIsInfoModalOpen(true)}
              title="CSV Format Info"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" className="hidden sm:flex" onClick={handleExportCSV}>Export CSV</Button>
          <Button onClick={() => openAddModal()} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Product Category
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <SearchBar 
            placeholder="Search by product name, category, or supplier..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="flex h-10 w-full sm:w-[140px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="stock_desc">Highest Stock</option>
            <option value="stock_asc">Lowest Stock</option>
            <option value="margin_desc">Highest Margin</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading inventory..." />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <InventoryCard 
              key={item.id} 
              item={item} 
              onEdit={() => openEditModal(item)} 
              onDelete={() => setItemToDelete(item)} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No inventory found</h3>
          <p className="text-slate-500 mt-2 max-w-sm">No products match your search criteria. Try adjusting your filters or adding a new item.</p>
          <Button variant="outline" className="mt-6" onClick={() => setSearchQuery('')}>Clear search filters</Button>
        </div>
      )}

      {/* Modal */}
      <AddInventoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingItem={editingItem}
      />
      
      <CSVFormatModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
        type="inventory" 
      />
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Confirm Deletion"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={async () => {
                try {
                  await deleteInventoryItem(itemToDelete.id);
                  console.log("Product deleted successfully");
                  setItemToDelete(null);
                } catch (err) {
                  console.error("Error deleting item:", err);
                }
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-slate-600">Are you sure you want to delete this product?</p>
      </Modal>

    </div>
  );
};

export default InventoryPage;
