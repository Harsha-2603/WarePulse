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

const InventoryPage = () => {
  const { inventoryItems = [], addInventoryItem, deleteInventoryItem, isLoading } = useInventory() || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('stock_desc');

  const handleExportCSV = () => {
    if (inventoryItems.length === 0) return;
    
    const headers = ['Name', 'Category/Variety', 'Grade', 'Stock', 'Unit', 'Purchase Price', 'Selling Price', 'Supplier'];
    const rows = filteredItems.map(item => [
      item.name,
      item.variety,
      item.grade,
      item.stock,
      item.unit,
      item.purchasePrice,
      item.sellingPrice,
      item.supplier
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
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
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("The CSV file is empty or missing data.");
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const required = ['name', 'price', 'stock', 'unit'];
      const missing = required.filter(field => !headers.some(h => h.includes(field)));

      if (missing.length > 0) {
        alert(`Rejected: Missing required columns: ${missing.join(', ')}`);
        return;
      }

      const nameIdx = headers.findIndex(h => h.includes('name'));
      const priceIdx = headers.findIndex(h => h.includes('price') && !h.includes('purchase'));
      const purchasePriceIdx = headers.findIndex(h => h.includes('purchase'));
      const stockIdx = headers.findIndex(h => h.includes('stock'));
      const unitIdx = headers.findIndex(h => h.includes('unit'));
      const varietyIdx = headers.findIndex(h => h.includes('variety') || h.includes('category'));
      const supplierIdx = headers.findIndex(h => h.includes('supplier'));

      let addedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        const newItem = {
          name: values[nameIdx],
          sellingPrice: parseFloat(values[priceIdx]) || 0,
          purchasePrice: purchasePriceIdx !== -1 ? parseFloat(values[purchasePriceIdx]) : (parseFloat(values[priceIdx]) * 0.8 || 0),
          stock: parseFloat(values[stockIdx]) || 0,
          unit: values[unitIdx],
          variety: varietyIdx !== -1 ? values[varietyIdx] : 'General',
          supplier: supplierIdx !== -1 ? values[supplierIdx] : 'imported',
          grade: 'Standard',
          lastUpdated: new Date().toISOString()
        };

        if (newItem.name && newItem.sellingPrice && newItem.stock && newItem.unit) {
          addInventoryItem(newItem);
          addedCount++;
        }
      }

      alert(`Successfully imported ${addedCount} products.`);
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

  const filteredItems = (inventoryItems || []).filter(item => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  }).sort((a, b) => {
    if (sortOption === 'stock_desc') return b.stock - a.stock;
    if (sortOption === 'stock_asc') return a.stock - b.stock;
    if (sortOption === 'margin_desc') {
      const marginA = (a.sellingPrice - a.purchasePrice) / a.sellingPrice;
      const marginB = (b.sellingPrice - b.purchasePrice) / b.sellingPrice;
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
