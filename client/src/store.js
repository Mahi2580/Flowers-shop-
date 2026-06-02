// Global Store using Zustand
import create from 'zustand';

export const useStore = create((set) => ({
  // User State
  user: null,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  logout: () => set({ user: null, isLoggedIn: false }),

  // Cart State
  cart: [],
  addToCart: (product) => set((state) => {
    const existingItem = state.cart.find(item => item._id === product._id);
    if (existingItem) {
      return {
        cart: state.cart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item._id !== productId)
  })),

  updateCartQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item =>
      item._id === productId ? { ...item, quantity } : item
    ).filter(item => item.quantity > 0)
  })),

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => {
    const { cart } = useStore.getState();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  // Products State
  products: [],
  setProducts: (products) => set({ products }),

  // Filters
  selectedCategory: 'All',
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query })
}));
