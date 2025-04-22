import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import App from './App.jsx'
import { BrowserRouter} from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
          <App />
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>,
)

