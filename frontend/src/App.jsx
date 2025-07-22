import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

const MENU = [
  {
    id: "s1",
    name: "Bruschetta",
    price: 8.99,
    category: "Starters",
    image: "https://recipesfiber.com/wp-content/uploads/2025/06/burrata-bruschetta-2025-06-06-022053.webp",
  },
  {
    id: "s2",
    name: "Spring Rolls",
    price: 6.99,
    category: "Starters",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIDBCFQ7zrTt3aBwzDghpGimj_109UB8HQBg&s",
  },
  {
    id: "m1",
    name: "Grilled Salmon",
    price: 18.49,
    category: "Main Course",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIOkrazSwNkf349Rk5RJq80ziIsyluhUW37Q&s",
  },
  {
    id: "m2",
    name: "Vegetarian Pasta",
    price: 12.99,
    category: "Main Course",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDh_JNeDTKKhAOCNbtwoCZBESHgSYicFb3xQ&s",
  },
  {
    id: "d1",
    name: "Chocolate Cake",
    price: 5.99,
    category: "Desserts",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsE4B9hauypUDJ6atiz1wEaZ5UYUUKWjFCqA&s",
  },
  {
    id: "d2",
    name: "Ice Cream",
    price: 4.99,
    category: "Desserts",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiIlTicIJ2J5P1yfD4dLDqxL1XBL_EFvZ_pA&s",
  },
];

function App() {
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [userPicture, setUserPicture] = useState(localStorage.getItem("userPicture") || "");
  const [googleId, setGoogleId] = useState(localStorage.getItem("googleId") || "");
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [bill, setBill] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState({ show: false, message: "", variant: "primary" });
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [animCartItem, setAnimCartItem] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("userName");
    const picture = params.get("picture");
    const gid = params.get("googleId");

    if (name && gid) {
      setUserName(name);
      setUserPicture(picture || "");
      setGoogleId(gid);

      localStorage.setItem("userName", name);
      localStorage.setItem("userPicture", picture || "");
      localStorage.setItem("googleId", gid);

      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("Welcome " + name, "success");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    document.body.classList.remove("theme-transition");
    setTimeout(() => document.body.classList.add("theme-transition"), 0);
  }, [theme]);

  useEffect(() => {
    document.body.style.color = theme === "dark" ? "#fff" : "#202020";
  }, [theme]);

  const fetchOrderHistory = useCallback(() => {
    const mockHistory = [
      {
        _id: "mock1",
        items: [
          { id: "s1", name: "Bruschetta", quantity: 2, price: 8.99 },
          { id: "d1", name: "Chocolate Cake", quantity: 1, price: 5.99 },
        ],
        total: 23.97,
        status: "pending",
      },
    ];
    setOrderHistory(mockHistory);
  }, []);

  useEffect(() => {
    if (googleId) fetchOrderHistory();
  }, [googleId, fetchOrderHistory]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const showToast = (message, variant = "primary", duration = 2800) => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ show: false }), duration);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setUserName(username || "Guest");
    setUserPicture("https://randomuser.me/api/portraits/men/75.jpg");
    setGoogleId("mockid123");
    localStorage.setItem("userName", username || "Guest");
    localStorage.setItem("userPicture", "https://randomuser.me/api/portraits/men/75.jpg");
    localStorage.setItem("googleId", "mockid123");
    fetchOrderHistory();
    showToast("Login successful!", "success");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setIsSignup(false);
    showToast("Signup successful! Now login.", "success");
  };

  const handleLogout = () => {
    localStorage.clear(); 
    setUserName("");
    setUserPicture("");
    setGoogleId("");
    setItems([]);
    setQuantities({});
    setOrderHistory([]);
    setBill(false);
    setOrderId(null);
    setOtp("");
    showToast("Logged out.", "primary");
  };

  const handleQuantityChange = (id, value) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, value) }));
  };

  const filteredMenu = MENU.filter((item) => filter === "All" || item.category === filter);

  const placeOrder = () => {
    const orderItems = items.map((item) => ({
      ...item,
      quantity: quantities[item.id] || 1,
    }));
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * (quantities[item.id] || 1), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    setOrderId("ORD-" + Date.now());
    setBill(true);
    setModalOpen(false);
    showToast("Order placed, OTP sent!", "success");
  };

  const confirmOrder = () => {
    setOrderHistory((prev) => [
      ...prev,
      {
        _id: orderId,
        items: items.map((item) => ({ ...item, quantity: quantities[item.id] || 1 })),
        total: items.reduce((sum, item) => sum + item.price * (quantities[item.id] || 1), 0) * 1.05,
        status: "completed",
      },
    ]);
    setOtp("");
    setBill(false);
    setModalOpen(true);
    setItems([]);
    setQuantities({});
    setOrderId(null);
    showToast("Order confirmed! 🎉", "success");
  };

  const updateOrderStatus = (id, status) => {
    setOrderHistory((prev) =>
      prev.map((order) => (order._id === id ? { ...order, status } : order))
    );
    showToast(`Order ${id} status updated to ${status}`, "success");
  };

  const handleAddCart = (item) => {
    setAnimCartItem(item.id);
    setTimeout(() => setAnimCartItem(null), 700);
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
    setQuantities((prev) => ({ ...prev, [item.id]: prev[item.id] || 1 }));
    showToast("Added to Cart", "success");
  };

  const handleRemoveCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[id];
      return newQuantities;
    });
  };

  const getCurrentDateString = () =>
    new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const CartModal = () => (
    <div className="cart-modal-bg" onClick={() => setModalOpen(false)}>
      <div
        className={`cart-modal glass-card ${theme} animate__animated animate__slideInRight`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">🛒 Your Cart</h4>
          <button
            className="btn-close btn-close-white"
            aria-label="Close"
            onClick={() => setModalOpen(false)}
          />
        </div>
        {items.length === 0 ? (
          <p className="text-center opacity-75 mt-5">Cart is empty</p>
        ) : (
          <div>
            {items.map((item) => (
              <div key={item.id} className="cart-item my-3 py-2 px-2">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`cart-list-img transition-img ${
                      animCartItem === item.id ? "fly-cart-img" : ""
                    }`}
                    loading="lazy"
                  />
                  <div className="flex-grow-1">
                    <div className="fw-bold">{item.name}</div>
                    <div className="small mb-2">${item.price.toFixed(2)}</div>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        className="form-control form-control-sm w-50"
                        value={quantities[item.id] || 1}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        style={{ maxWidth: 55 }}
                      />
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-between mt-3 fw-bold fs-5">
              <span>Total</span>
              <span>
                ${(items.reduce((sum, item) => sum + item.price * (quantities[item.id] || 1), 0) * 1.05).toFixed(2)}
              </span>
            </div>
            <button
              className="btn btn-success mt-4 w-100 fs-5 rounded-pill"
              onClick={placeOrder}
              disabled={items.length === 0}
            >
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const OtpSection = () => (
    <div className={`otp-section-pro glass-card ${theme}`}>
      <h4 className="mb-3 fw-bold text-center">🔑 Enter your OTP</h4>
      <p className="mb-2 text-center fs-6 opacity-75">
        We've sent an OTP to your email. Enter below to confirm the order.
      </p>
      <div className="d-flex justify-content-center mb-3">
        <OtpInput otp={otp} setOtp={setOtp} />
      </div>
      <button
        className="btn btn-primary w-100 fs-5 py-2 rounded-pill"
        disabled={otp.length !== 6}
        onClick={confirmOrder}
      >
        Confirm Order
      </button>
    </div>
  );

  function OtpInput({ otp, setOtp }) {
    return (
      <div className="otp-digit-group">
        {Array(6)
          .fill(0)
          .map((_, idx) => (
            <input
              key={idx}
              type="text"
              className="otp-digit"
              maxLength={1}
              value={otp[idx] || ""}
              onChange={(e) => {
                let chars = otp.split("");
                chars[idx] = e.target.value.replace(/[^0-9]/g, "");
                setOtp(chars.join("").slice(0, 6));
                if (e.target.value && idx < 5)
                  document.getElementById(`otp-${idx + 1}`)?.focus();
              }}
              id={`otp-${idx}`}
              style={{ color: theme === "dark" ? "#fff" : "#151515" }}
              autoFocus={idx === 0}
            />
          ))}
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      {toast.show && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show text-bg-${toast.variant} border-0`}>
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                className="btn-close me-2 m-auto"
                onClick={() => setToast({ show: false })}
              ></button>
            </div>
          </div>
        </div>
      )}

      <div className="theme-bg-anim"></div>

      {!userName ? (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
          <div className={`glass-card w-100 auth-card shadow-lg ${theme}`} style={{ maxWidth: 420 }}>
            <h3 className="text-center mb-3 mt-2 fw-bold">{isSignup ? "Sign Up" : "Login"}</h3>
            <form onSubmit={isSignup ? handleSignup : handleLogin}>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ color: theme === "dark" ? "#fff" : "#151515" }}
                  placeholder=" "
                />
                <label htmlFor="username">Username</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ color: theme === "dark" ? "#fff" : "#151515" }}
                  placeholder=" "
                />
                <label htmlFor="password">Password</label>
              </div>
              {isSignup && (
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ color: theme === "dark" ? "#fff" : "#151515" }}
                    placeholder=" "
                  />
                  <label htmlFor="email">Email</label>
                </div>
              )}
              <button type="submit" className="btn btn-primary w-100 mb-2 fs-5 py-2 mt-2 rounded-pill">
                {isSignup ? "Create Account" : "Login"}
              </button>
              <button
                type="button"
                className="btn btn-link w-100 fs-6"
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Already have an account? Login" : "No account? Sign up"}
              </button>
              <a href="http://localhost:5000/auth/google" className="btn btn-outline-secondary mt-2 w-100">
                Sign in with Google
              </a>
            </form>
          </div>
        </div>
      ) : (
        <div className="container">
          <h5 className="text-end text-secondary mb-3">📅 {getCurrentDateString()}</h5>
          <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow mb-4 py-3 px-4 rounded-3 d-flex align-items-center">
            <a className="navbar-brand fw-bolder fs-4" href="#">
              MenuApp
            </a>
            <div className="ms-auto d-flex gap-3 align-items-center">
              {userPicture && (
                <img src={userPicture} alt="user" className="rounded-circle profile-pic" />
              )}
              <span className="fw-semibold fs-5" style={{ color: "#fff" }}>
                {userName}
              </span>
              <div className="theme-toggle-wrap">
                <input
                  type="checkbox"
                  id="switchTheme"
                  className="form-check-input theme-switch-big"
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                />
                <label className="form-check-label ps-3" htmlFor="switchTheme">
                  {theme === "dark" ? "Dark" : "Light"}
                </label>
              </div>
              <button className="btn btn-danger btn-sm px-3" onClick={handleLogout}>
                Logout
              </button>
              <button
                className="btn btn-outline-light btn-cart d-flex align-items-center px-3"
                style={{ position: "relative" }}
                onClick={() => setModalOpen(true)}
              >
                <span className="fs-4">🛒</span>
                {items.length > 0 && <span className="cart-badge">{items.length}</span>}
              </button>
            </div>
          </nav>

          <div className="d-flex mb-3 align-items-center gap-2">
            <label>Filter by:</label>
            <select
              className="form-select w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Starters">Starters</option>
              <option value="Main Course">Main Course</option>
              <option value="Desserts">Desserts</option>
            </select>
          </div>

          <div className="d-flex gap-4 flex-wrap mb-5 menu-anim">
            {filteredMenu.map((item) => (
              <div className="glass-card menu-card p-3" key={item.id}>
                <div className="menu-img-box">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`img-fluid rounded ${animCartItem === item.id ? "fly-item-img" : ""}`}
                    loading="lazy"
                  />
                </div>
                <h6 className="fw-bold">{item.name}</h6>
                <p className="text-muted">${item.price.toFixed(2)}</p>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    checked={items.find((i) => i.id === item.id) || false}
                    onChange={(e) =>
                      e.target.checked ? handleAddCart(item) : handleRemoveCart(item.id)
                    }
                    className="form-check-input me-2"
                    aria-label={`Select ${item.name}`}
                  />
                  <input
                    type="number"
                    min="1"
                    value={quantities[item.id] || 1}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="form-control w-25"
                    aria-label={`Quantity for ${item.name}`}
                    style={{ maxWidth: "60px" }} // Increased width for visibility
                  />
                  <span className="quantity-display">{quantities[item.id] || 1}</span> {/* Added display */}
                </div>
              </div>
            ))}
          </div>

          {bill && (
            <div className="d-flex justify-content-center mt-4">
              <OtpSection />
            </div>
          )}

          {modalOpen && items.length > 0 && <CartModal />}

          {modalOpen && (
            <div className="alert alert-success mt-3 text-center">🎉 Order confirmed and receipt emailed!</div>
          )}

          {orderHistory.length > 0 && (
            <div className="order-history mt-4">
              <h4 className="mb-3">Order History</h4>
              {orderHistory.map((order) => (
                <div key={order._id} className="glass-card p-3 mb-3">
                  <p>
                    <strong>Order ID:</strong> {order._id}
                  </p>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.name} x{item.quantity} — ${(item.quantity * item.price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Total:</strong> ${order.total.toFixed(2)}
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    <label>Status:</label>
                    <select
                      className="form-select w-auto"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;