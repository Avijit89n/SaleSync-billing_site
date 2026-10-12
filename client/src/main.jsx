import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from './components/ui/sonner';
import { injectStore } from './axios/interceptor.js';
import { Buffer } from 'buffer';
import './i18n';

injectStore(store);
window.Buffer = Buffer;

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Toaster
      duration={3000}
      position="top-center"
      theme="light"
      richColors
      reverseOrder={false}
    />
    <App />
  </Provider>
);
