# 🛒 eCommerce-Project

A full-stack MERN (MongoDB, Express, React, Node.js) eCommerce platform with secure payment integration using Razorpay, email notifications, authentication, and a complete shopping cart workflow.

---

## 📁 Project Structure
Project E-Commerce/ ├── frontend/ # React.js Frontend (Vite) ├── backend/ # Node.js & Express Backend ├── .env # Environment variables (not committed)


---

## 🚀 Features

- User authentication (JWT + sessions)
- Add to cart, checkout, and Razorpay payments
- Save user addresses and order history
- Admin panel (optional)
- Email confirmation on order placement

---

## 🛠️ Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Payments:** Razorpay
- **Email Service:** SMTP via Brevo (Sendinblue)

---

## 💳 Razorpay Integration

Razorpay payment integration is handled in the frontend inside:
frontend/src/page/user/order/Checkout.jsx

In `Checkout.jsx`, you will need to manually add your Razorpay key directly in the code like this:

```javascript
 key = '00000000000000'; // Add your Razorpay Key here
⚠️ Important: Do not expose sensitive keys in the frontend code for production environments. This method should only be used for development purposes.



📦 Environment Setup

Create a .env file in the backend/ directory with the following:
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
NODE_ENV=development
SESSION_SECRET=your_session_secret

# SMTP Email Settings
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SENDER_EMAIL=your_email@example.com

# Razorpay Keys (for development)
RAZORPAY_ID_KEY=your_razorpay_key_id
RAZORPAY_SECRET_KEY=your_razorpay_secret

 Never commit .env files to GitHub.
🧪 How to Run
Backend:
cd backend
npm install
npm start
Frontend:

cd frontend
npm install
npm run dev
🔐 Security Notes
Important: This approach of directly placing the Razorpay key in Checkout.jsx is suitable only for development purposes. For production, you should consider more secure methods for storing and accessing your API keys.

Never expose secrets (MongoDB URI, Razorpay keys, SMTP credentials) in public repositories.

💡 Future Improvements
Add product reviews & ratings

Implement Admin dashboard

Improve mobile responsiveness

📬 Contact
Arshid EM
📧 arshidem0@gmail.com

⭐ Star the repo if you like it!



### Key Changes:
- The Razorpay key is manually added in the `Checkout.jsx` page.
- A warning is included regarding the security of using hardcoded keys in production.

Let me know if you need further changes!
