import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import Navbar from "../../../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../../../css/Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, token, getAuthState } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  useEffect(() => {
    getAuthState();
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    houseNo: "",
    city: "",
    state: "",
    pin: "",
    phone: "",
    email: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    if (!userData?.userId) return;

    fetchCartItems();
    fetchUserAddress();
  }, [userData]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/cart/${userData.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const items = response.data.cart.items || [];
      setCartItems(items);

      const calculatedTotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setTotalPrice(calculatedTotal);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddress = async () => {
    if (!userData?.userId) return;

    try {
      const response = await axios.get(
        `${backendUrl}/api/addresses/${userData.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.addresses?.length > 0) {
        const defaultAddress =
          response.data.addresses.find((addr) => addr.isDefault) ||
          response.data.addresses[0];
        setFormData((prev) => ({
          ...prev,
          firstName: defaultAddress.firstName || "",
          lastName: defaultAddress.lastName || "",
          houseNo: defaultAddress.houseNo || "",
          city: defaultAddress.city || "",
          state: defaultAddress.state || "",
          pin: defaultAddress.pin || "",
          phone: defaultAddress.phone || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching address:", err);
      setError("Failed to load address.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (cartItems.length === 0) {
      toast.error("Please add products to your cart before placing an order.");
      return;
    }
  
    if (!formData.agreeToTerms) {
      toast.error("You must agree to the terms & conditions.");
      return;
    }
  
    // Address Validation: Check if any field is empty
    const requiredFields = ["firstName", "lastName", "houseNo", "city", "state", "pin", "phone"];
    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        toast.error("Please fill your address details before placing the order.");
        return;
      }
    }
  
    try {
      const orderData = {
        amount: totalPrice * 100, // Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
  
      // Step 1: Create order on backend
      const response = await axios.post(`${backendUrl}/api/order`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.data.success) {
        toast.error("Order placement failed.");
        return;
      }
  
      const { order } = response.data;
      // console.log("Order Details:", order);
  
      // Step 2: Open Razorpay payment UI
      const options = {
        key: "your RAZORPAY_ID_KEY",
        amount: order.amount,
        currency: order.currency,
        name: "Shopzy",
        description: "Purchase Description",
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async function (response) {
          // Step 3: Save Order in Database
          const orderDetails = {
            orderId: response?.razorpay_order_id,
            userId: userData?.userId,
            userName: userData?.name,
            email: userData?.email,
            address: {
              firstName: formData?.firstName,
              lastName: formData?.lastName,
              houseNo: formData?.houseNo,
              city: formData?.city,
              state: formData?.state,
              pin: formData?.pin,
              phone: formData?.phone,
            },
            cartItems: cartItems?.map((item) => ({
              productId: item?.productId?._id,
              name: item?.productId?.name,
              quantity: item?.quantity,
              price: item?.price,
            })),
            deliveryStatus: "Pending",
            totalAmount: totalPrice,
            paymentDetails: {
              orderId: response?.razorpay_order_id,
              paymentId: response?.razorpay_payment_id,
              signature: response?.razorpay_signature,
              status: "Paid",
            },
            createdAt: new Date(),
          };
  
          // console.log("Order Details Being Sent:", orderDetails);
  
          try {
            await axios.post(`${backendUrl}/api/orders/save`, orderDetails, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (error) {
            console.error("Error saving order:", error.response?.data || error.message);
          }
  
          const products = cartItems?.map((item) => ({
            productId: item?.productId?._id,
            quantity: item?.quantity,
          }));
  
          await axios.post(`${backendUrl}/product/decrease-stock`, { products }, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          // Clear cart after successful order
          await axios.delete(`${backendUrl}/api/cart/clear/${userData.userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          toast.success("Order placed successfully!");
          navigate("/");
        },
        prefill: {
          name: userData.name || "Guest",
          email: userData.email || "guest@example.com",
          contact: userData.phone || "0000000000",
        },
        theme: {
          color: "#3399cc",
        },
      };
  
      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        toast.error("Payment Failed! Please try again.");
        console.error("Payment Failed", response);
      });
  
      rzp1.open();
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Error occurred while placing the order.");
    }
  };
  
  
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center', gap:'15px'}}>
      <button onClick={handleBack} className="back-btn">←</button>
           <h2 className="cart-title">Checkout Page</h2>
     </div>

      <div className="checkout-container">
  {/* Left Column: Billing Details */}
  <div className="left-column">
    <h2>Billing Details</h2>
    <div className="checkout-input-group">
      <label>First Name:</label>
      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
    </div>
    <div className="checkout-input-group">
      <label>Last Name:</label>
      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
    </div>
    <div className="checkout-input-group">
      <label>House No:</label>
      <input type="text" name="houseNo" value={formData.houseNo} onChange={handleChange} required />
    </div>
    <div className="checkout-input-group">
      <label>City:</label>
      <input type="text" name="city" value={formData.city} onChange={handleChange} required />
    </div>
    <div className="checkout-input-group">
      <label>State:</label>
      <input type="text" name="state" value={formData.state} onChange={handleChange} required />
    </div>
    <div className="checkout-input-group">
      <label>Pincode:</label>
      <input type="text" name="pin" value={formData.pin} onChange={handleChange} required />
    </div>
    <div className="checkout-input-group">
      <label>Phone:</label>
      <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
    </div>
  </div>

  {/* Right Column: Order Summary & Payment */}
  <div className="right-column">
    <h2>Your Order</h2>
    <div className="order-summary">
      {cartItems.length === 0 ? (
        <p>No items in your cart.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.productId._id} className="checkout-item">
            <p>{item.productId.name}</p>
            <p>{item.quantity} x ₹{item.price.toFixed(2)}</p>
    
          </div>
        ))
      )}
      <div>
        <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
      </div>
     
    </div>

    <div className="terms">
      <input className="checkbox" type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} required />
      <label>I agree to the terms & conditions</label>
    </div>

    <button type="submit" className="place-order-btn" onClick={handleSubmit}>Place Order</button>
  </div>
</div>

    </div>
  );
};

export default Checkout;
