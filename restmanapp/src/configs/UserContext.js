import React, { createContext, useReducer } from 'react';
import cookie from 'react-cookies';
import userReducer from '../reducers/UserReducer';


// Tạo Context
export const UserContext = createContext();

// Provider để bọc toàn bộ ứng dụng
export const UserProvider = ({ children }) => {
    // Lấy thông tin user từ cookie nếu có, nếu không thì là null
    const [user, dispatch] = useReducer(userReducer, cookie.load("user") || null);

    const login = (userData) => {
        cookie.save("user", userData);
        dispatch({
            type: "LOGIN",
            payload: userData
        });
    };

    const logout = () => {
        cookie.remove("user");
        dispatch({ type: "LOGOUT" });
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
