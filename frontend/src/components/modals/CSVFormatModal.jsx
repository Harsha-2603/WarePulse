import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Download, FileText } from 'lucide-react';

const CSVFormatModal = ({ isOpen, onClose, type }) => {
  const isInventory = type === 'inventory';
  
  const config = {
    inventory: {
      title: 'Inventory CSV Format',
      header: 'product_name,supplier,stock_quantity,unit,purchase_price,selling_price',
      example: 'Rice Premium,Andhra Rice Co,50,kg,4200,4500\nSugar,Local Supplier,100,kg,55,60\nWheat Flour,Grain Traders,25,kg,38,45',
      required: ['product_name', 'stock_quantity', 'unit', 'purchase_price', 'selling_price'],
      optional: ['supplier'],
      fileName: 'inventory_template.csv'
    },
    customer: {
      title: 'Customer CSV Format',
      header: 'customer_name,email,phone,address,city,state,pincode,gst_number',
      example: 'Ramesh Supermarket,ramesh@gmail.com,9876543210,123 Main Market Rd,Hyderabad,Telangana,500001,36AABCT1234D1Z5\nPriya Stores,priya@gmail.com,9123456780,45 Anna Nagar,Chennai,Tamil Nadu,600028,33PQRSX5678L1Z2\nKumar Traders,kumar@gmail.com,9988776655,78 MG Road,Bengaluru,Karnataka,560001,29ABCDE1234F1Z7',
      required: ['customer_name', 'phone'],
      optional: ['email', 'address', 'city', 'state', 'pincode', 'gst_number'],
      fileName: 'customer_template.csv'
    },
    vendor: {
      title: 'Vendor CSV Format',
      header: 'vendor_name,gst_number,phone,email,account_number,ifsc_code,bank_branch',
      example: 'Global Tech Suppliers,29ABCDE1234F1Z5,9876543210,supplier@company.com,50100456123456,HDFC0001234,Banjara Hills Hyderabad\nAndhra Rice Traders,37PQRSX5678L1Z2,9123456780,andhra@rice.com,123456789012,SBIN0000456,Vijayawada Branch\nFresh Mart Supplies,29LMNOP1234K1Z8,9988776655,freshmart@gmail.com,789456123000,ICIC0009876,Chennai Central',
      required: ['vendor_name', 'phone'],
      optional: ['gst_number', 'email', 'account_number', 'ifsc_code', 'bank_branch'],
      fileName: 'vendor_template.csv'
    }
  }[type];

  const handleDownloadDraft = () => {
    const csvContent = `${config.header}\n${config.example}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', config.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={config.title}
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={handleDownloadDraft}>
            <Download className="w-4 h-4 mr-2" />
            Download Sample CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            CSV Header & Example
          </h3>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-indigo-300 overflow-x-auto border border-slate-700 leading-relaxed">
            <div className="opacity-50 select-none pb-1"># Header Row</div>
            <div className="text-white font-bold">{config.header}</div>
            <div className="opacity-50 select-none py-1"># Example Data</div>
            <div>{config.example}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Required Fields</h4>
            <ul className="space-y-1">
              {config.required.map(field => (
                <li key={field} className="flex items-center text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Optional Fields</h4>
            <ul className="space-y-1">
              {config.optional.map(field => (
                <li key={field} className="flex items-center text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">Note:</p>
          <p className="opacity-80">Make sure the headers exactly match the names shown above. Do not include spaces between commas.</p>
        </div>
      </div>
    </Modal>
  );
};

export default CSVFormatModal;
