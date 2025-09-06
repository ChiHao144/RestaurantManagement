import React, { createContext, useState, useEffect } from 'react';

export const TableContext = createContext();

export const TableProvider = ({ children }) => {
    const [tableId, setTableId] = useState(null);

    // Tự động tải mã bàn từ sessionStorage khi ứng dụng khởi động
    useEffect(() => {
        const storedTableId = sessionStorage.getItem('currentTableId');
        if (storedTableId) {
            setTableId(storedTableId);
        }
    }, []);

    // Hàm để thiết lập bàn mới và lưu vào sessionStorage
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
