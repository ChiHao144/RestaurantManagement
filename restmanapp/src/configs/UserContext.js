import React, { createContext, useReducer } from 'react';
import cookie from 'react-cookies';
import userReducer from '../reducers/UserReducer';


export const UserContext = createContext();

export const UserProvider = ({ children }) => {
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
