import { create } from 'zustand';

export interface CartItem {
    inventoryId: string;
    name: string;
    brand: string;
    weight: string;
    price: number;
    quantity: number;
}

interface CartState {
    shopId: string | null;
    shopName: string | null;
    items: CartItem[];
    
    addItem: (item: Omit<CartItem, 'quantity'>, shopId: string, shopName: string) => boolean; // Returns false if shop mismatch
    removeItem: (inventoryId: string) => void;
    decrementItem: (inventoryId: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    shopId: null,
    shopName: null,
    items: [],

    addItem: (item, shopId, shopName) => {
        const state = get();
        
        // If cart is not empty and shop differs, reject the addition
        if (state.shopId && state.shopId !== shopId && state.items.length > 0) {
            return false;
        }

        set((state) => {
            const existingItem = state.items.find(i => i.inventoryId === item.inventoryId);
            if (existingItem) {
                return {
                    shopId,
                    shopName,
                    items: state.items.map(i => 
                        i.inventoryId === item.inventoryId 
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    )
                };
            }
            
            return {
                shopId,
                shopName,
                items: [...state.items, { ...item, quantity: 1 }]
            };
        });
        
        return true;
    },

    removeItem: (inventoryId) => {
        set((state) => {
            const newItems = state.items.filter(i => i.inventoryId !== inventoryId);
            return {
                items: newItems,
                shopId: newItems.length === 0 ? null : state.shopId,
                shopName: newItems.length === 0 ? null : state.shopName,
            };
        });
    },

    decrementItem: (inventoryId) => {
        set((state) => {
            const existingItem = state.items.find(i => i.inventoryId === inventoryId);
            if (existingItem && existingItem.quantity > 1) {
                return {
                    items: state.items.map(i => 
                        i.inventoryId === inventoryId 
                            ? { ...i, quantity: i.quantity - 1 }
                            : i
                    )
                };
            }
            
            // If 1 or less, remove it completely
            const newItems = state.items.filter(i => i.inventoryId !== inventoryId);
            return {
                items: newItems,
                shopId: newItems.length === 0 ? null : state.shopId,
                shopName: newItems.length === 0 ? null : state.shopName,
            };
        });
    },

    clearCart: () => set({ shopId: null, shopName: null, items: [] }),

    getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    }
}));
