import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-auto rounded-xl border border-slate-200 shadow-sm">
      <table className={`w-full text-sm text-left ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-slate-200 bg-white ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableEmptyState = ({ colSpan = 1, icon: Icon, title = "No data found", description = "There are no records to display matching your criteria." }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Icon className="h-6 w-6 text-slate-500" />
            </div>
          )}
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
        </div>
      </td>
    </tr>
  );
};

export const TableRow = ({ children, className = '', hover = true, ...props }) => {
  return (
    <tr className={`${hover ? 'hover:bg-slate-50 transition-colors' : ''} ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th scope="col" className={`px-6 py-3 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-slate-700 ${className}`} {...props}>
      {children}
    </td>
  );
};

export default Table;
