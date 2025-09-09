import React, { createContext, useState, useEffect } from 'react';

export const TableContext = createContext();

export const TableProvider = ({ children }) => {
    const [tableId, setTableId] = useState(null);

    
    useEffect(() => {
        const storedTableId = sessionStorage.getItem('currentTableId');
        if (storedTableId) {
            setTableId(storedTableId);
        }
    }, []);

    
    const setCurrentTable = (id) => {
        if (id) {
            sessionStorage.setItem('currentTableId', id);
            setTableId(id);
        } else {
            sessionStorage.removeItem('currentTableId');
            setTableId(null);
        }
    };

    return (
        <TableContext.Provider value={{ tableId, setCurrentTable }}>
            {children}
        </TableContext.Provider>
    );
};
