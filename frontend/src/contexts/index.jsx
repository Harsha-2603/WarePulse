import React from 'react';
import { AuthProvider } from './AuthContext';
import { InventoryProvider } from './InventoryContext';
import { CustomerProvider } from './CustomerContext';
import { VendorProvider } from './VendorContext';
import { OrderProvider } from './OrderContext';
import { InvoiceProvider } from './InvoiceContext';
import { ToastProvider } from './ToastContext';

export const AppContextProvider = ({ children }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <InventoryProvider>
          <CustomerProvider>
            <VendorProvider>
              <OrderProvider>
                <InvoiceProvider>
                  {children}
                </InvoiceProvider>
              </OrderProvider>
            </VendorProvider>
          </CustomerProvider>
        </InventoryProvider>
      </AuthProvider>
    </ToastProvider>
  );
};
