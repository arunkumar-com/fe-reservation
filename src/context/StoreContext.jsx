// // import { createContext, useEffect, useState } from "react";
// // import { food_list } from "../assets/assets";
// import { createContext, useEffect, useState } from "react";
// import { food_list as staticFoodList } from "../assets/assets";  // rename import
// import axios from "axios";

// export const StoreContext = createContext(null)

// const StoreContextProvider = (props) => {

//     const [cartItems, setCartItems] = useState({});
//     // const url = "https://foodify-backend-7hnv.onrender.com";
//     const url= "https://be-reservation-1.onrender.com/api";
//     const [token, setToken] = useState();
//     // const [food_list, setFoodList] = useState([])
//     const [food_list, setFoodList] = useState(staticFoodList)


//     const addToCart = async (itemId) => {
//         if (!cartItems[itemId]) {
//             setCartItems((prev) => ({ ...prev, [itemId]: 1 }))
//         }
//         else {
//             setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
//         }

//         if (token) {
//             await axios.post(url + "/api/cart/add", {itemId}, {headers: {token}})
//         }
//     }

//     const removeFromCart = async (itemId) => {
//         setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))

//         if (token) {
//             await axios.post(url + "/api/cart/remove", {itemId}, {headers: {token}})
//         }
//     }

//     const getTotalCartAmount = () => {
//         let totalAmount = 0;
//         for (const item in cartItems) {
//             if (cartItems[item] > 0) {
//                 let itemInfo = food_list.find((product) => product._id === item);
//                 totalAmount += itemInfo.price * cartItems[item];
//             }
//         }
//         return totalAmount;
//     }

//     const fetchFoodList = async () =>  {
//         // const response = await axios.get(url + "/api/food/list");
//         // setFoodList(response.data.data);
//         try {
//           const response = await axios.get(url + "/api/food/list");
//           setFoodList(response.data.data);
//         } catch (err) {
//           console.warn("Failed to fetch API — using staticFoodList", err);
//           // keep staticFoodList in state
//         }
//     }

//     const loadCartData = async (token) => {
//         const response = await axios.post(url + "/api/cart/get", {}, {headers: {token}});
//         setCartItems(response.data.cartData);
//     }

//     useEffect(() => {
//         async function loadData() {
//             await fetchFoodList();
//             if (localStorage.getItem("token")) {
//                 setToken(localStorage.getItem("token"))
//                 await loadCartData(localStorage.getItem("token"))
//             }
//         }
//         loadData();

//     }, [])


//     const contextValue = {
//         food_list,
//         cartItems,
//         setCartItems,
//         addToCart,
//         removeFromCart,
//         getTotalCartAmount,
//         url,
//         token,
//         setToken
//     }

//     return (
//         <StoreContext.Provider value={contextValue}>
//             {props.children}
//         </StoreContext.Provider>
//     )
// }

// export default StoreContextProvider;


import { createContext, useEffect, useState } from "react";
import { food_list as staticFoodList } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // Base API URL, set via env or fallback
  const API_BASE = process.env.REACT_APP_API_URL || "https://be-reservation-1.onrender.com";

  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [foodList, setFoodList] = useState(staticFoodList);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch the list of food items
  const fetchFoodList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/food/list`, {
        withCredentials: true,
      });
      if (response.data && response.data.data) {
        setFoodList(response.data.data);
      }
    } catch (err) {
      console.warn("Failed to fetch API — using staticFoodList", err);
      setError(err);
      // keep staticFoodList
    } finally {
      setLoading(false);
    }
  };

  // Load cart data from backend if logged in
  const loadCartData = async (authToken) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/cart/get`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        }
      );
      if (response.data && response.data.cartData) {
        setCartItems(response.data.cartData);
      }
    } catch (err) {
      console.error("Failed to load cart data", err);
    }
  };

  // Add item to cart (frontend + backend)
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

    if (token) {
      try {
        await axios.post(
          `${API_BASE}/api/cart/add`,
          { itemId },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error("Failed to add to cart", err);
      }
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 1) - 1, 0),
    }));

    if (token) {
      try {
        await axios.post(
          `${API_BASE}/api/cart/remove`,
          { itemId },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error("Failed to remove from cart", err);
      }
    }
  };

  // Compute total amount safely
  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
      if (qty <= 0) return total;
      const itemInfo = foodList.find((f) => f._id === itemId);
      return itemInfo ? total + itemInfo.price * qty : total;
    }, 0);
  };

  // Initial load
  useEffect(() => {
    fetchFoodList();
    if (token) loadCartData(token);
  }, [token]);

  // Provide context value
  const contextValue = {
    foodList,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    API_BASE,
    token,
    setToken,
    loading,
    error,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
