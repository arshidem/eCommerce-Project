import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './page/user/Home'
import UserRegister from './page/user/auth/UserRegister'
import UserSignIn from './page/user/auth/UserSignIn'
import EmailVerify from './page/user/auth/EmailVerify'
import ResetPassword from './page/user/auth/ResetPassword'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import EnterOtp from './page/user/auth/EnterOtp'
import Cart from './page/user/navbar/Cart'
import UserOrders from './page/user/order/UserOrders'
import AdminSignin from './page/admin/AdminSignin'
import AddProduct from './page/admin/AddProduct'
import AllOrders from './page/admin/AllOrders'
import ProductDetails from './page/user/order/ProductDetails'
import Checkout from './page/user/order/Checkout'
import AddressList from './page/user/address/AddressList'
import AddAddress from './page/user/address/AddAddress'
import AddressEdit from './page/user/address/AddressEdit'
import EditProduct from './page/admin/EditProduct'
import Profile from './page/user/navbar/Profile'
import SendResetOtp from './page/user/auth/sendResetOtp'
import EnterResetOtp from './page/user/auth/EnterResetOtp'
import NewPassword from './page/user/auth/NewPassword'
import AdminProducts from './page/admin/AdminProducts'
import Dashboard from './page/admin/Dashboard'
import OrderDetails from './page/admin/OrderDetails'
import AdminHome from './page/admin/AdminHome'
import UserSlidebar from './page/user/navbar/UserSlidebar'
import AllUsers from './page/admin/AllUsers'
// import './App.css';  

const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/register' element={<UserRegister/>}></Route>
        <Route path='/signin' element={<UserSignIn/>}></Route>
        <Route path='/verify-email' element={<EmailVerify/>}></Route>
        <Route path='/verify-otp' element={<EnterOtp/>}></Route>
        <Route path='/reset-password' element={<SendResetOtp/>}></Route>
        <Route path='/verify-reset-otp/:email' element={<EnterResetOtp/>}></Route>
        <Route path='/reset/password' element={<ResetPassword/>}></Route>
        <Route path='/new/password/:email' element={<NewPassword/>}></Route>

        <Route path='/cart' element={<Cart/>}></Route>
        <Route path='/user' element={<UserSlidebar/>}></Route>
        <Route path='/orders' element={<UserOrders/>}></Route>
        <Route path='/profile' element={<Profile/>}></Route>


        <Route path='/admin' element={<AdminSignin/>}></Route>
        <Route path='/all-orders' element={<AllOrders/>}></Route>
        <Route path='/admin-products' element={<AdminProducts/>}></Route>
        <Route path='/admin-home' element={<AdminHome/>}></Route>
        <Route path='/all-users' element={<AllUsers/>}></Route>

        <Route path='/dashboard' element={<Dashboard/>}></Route>
        <Route path="/order-details/:orderId" element={<OrderDetails />} /> {/* Route for Order Details */}



        <Route path='/add-product' element={<AddProduct/>}></Route>
        <Route path='/edit-product/:productId' element={<EditProduct/>}></Route>


        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/address" element={<AddressList />} />
        <Route path="/add-address" element={<AddAddress />} />
        <Route path="/address/edit/:addressId" element={<AddressEdit />} />


      </Routes>

    </div>
  )
}

export default App