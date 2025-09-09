import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';

export const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.find(item => item.id === action.payload.id);
            if (existingItem) {
                return state.map(item =>
                    item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...state, { ...action.payload, quantity: 1 }];
        }
        case 'UPDATE_QUANTITY': {
            return state.map(item =>
                item.id === action.payload.itemId
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            ).filter(item => item.quantity > 0);
        }
        case 'REMOVE_ITEM': {
            return state.filter(item => item.id !== action.payload.itemId);
        }
        case 'CLEAR_CART': {
            return [];
        }
        case 'LOAD_CART': {
            return action.payload;
        }
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const { user } = useContext(UserContext);


    const localStorageKey = user ? `cart_${user.id}` : 'cart_guest';

    const initialState = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    const [cart, dispatch] = React.useReducer(cartReducer, initialState);


    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(cart));
    }, [cart, localStorageKey]);


    useEffect(() => {
        if (!user) {
            dispatch({ type: 'CLEAR_CART' });
        }
    }, [user]);

    const addToCart = (item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };

    const updateQuantity = (itemId, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
