'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import HomeScreen from '../../components/Surf/HomeScreen';
import CategoriesScreen from '../../components/Surf/CategoriesScreen';
import ProductScreen from '../../components/Surf/ProductScreen';
import CartScreen from '../../components/Surf/CartScreen';
import ProfileScreen from '../../components/Surf/ProfileScreen';
import OrdersScreen from '../../components/Surf/OrdersScreen';
import { TelegramProvider, useTelegram } from '@/context/TelegramContext';

function SurfApp() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'categories' | 'product' | 'cart' | 'orders'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [previousScreen, setPreviousScreen] = useState<'home' | 'categories' | 'product' | 'orders'>('home');
  const [cartItems, setCartItems] = useState<Array<{id: string, quantity: number}>>([]);
  const [newOrderNumber, setNewOrderNumber] = useState<string | undefined>(undefined);
  
  const { isFullScreenEnabled, webApp, telegramHeaderPadding, initializeTelegramApp } = useTelegram();

  // Количество товаров в корзине
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Метод для сброса корзины и сохранения номера заказа
  const resetCartAndSetOrder = (orderNumber?: string) => {
    setCartItems([]);
    if (orderNumber) {
      setNewOrderNumber(orderNumber);
    }
  };

  // Метод для добавления товара в корзину
  const addToCart = (productId: string, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === productId);
      if (existingItem) {
        return prev.map(item => 
          item.id === productId ? {...item, quantity: item.quantity + quantity} : item
        );
      } else {
        return [...prev, {id: productId, quantity}];
      }
    });
  };

  useEffect(() => {
    // Проверка, находимся ли мы в контексте Telegram или в обычном браузере
    const isTelegramWebApp = typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;
    
    // Инициализация Telegram WebApp только если он доступен
    if (isTelegramWebApp && webApp) {
      initializeTelegramApp();
    } else {
      console.log('Running in browser mode, skipping Telegram WebApp initialization');
    }
  }, [webApp, initializeTelegramApp]);

  // Устанавливаем CSS-переменную для отступа в зависимости от режима фулскрин
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Проверка, находимся ли мы в контексте Telegram
      const isTelegramWebApp = typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;
      
      // Устанавливаем отступы только если мы в Telegram и включен полноэкранный режим
      if (isTelegramWebApp && isFullScreenEnabled && currentScreen !== 'home' && currentScreen !== 'product') {
        document.documentElement.style.setProperty(
          '--telegram-header-padding', 
          `${telegramHeaderPadding}px`
        );
        document.documentElement.style.setProperty(
          '--telegram-header-gradient',
          'linear-gradient(to bottom, #1D1816 90%, #1D1816 95%)'
        );
      } else {
        // В обычном браузере или если не в полноэкранном режиме
        document.documentElement.style.setProperty('--telegram-header-padding', '0px');
        document.documentElement.style.setProperty('--telegram-header-gradient', 'none');
      }
    }
  }, [isFullScreenEnabled, telegramHeaderPadding, currentScreen]);

  const transitionTo = (screen: 'home' | 'categories' | 'product' | 'cart' | 'orders', callback?: () => void) => {
    setIsTransitioning(true);
    if ((screen === 'cart' || screen === 'orders') && currentScreen !== 'cart' && currentScreen !== 'orders') {
      setPreviousScreen(currentScreen);
    }
    setTimeout(() => {
      if (callback) callback();
      setCurrentScreen(screen);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const goToCategories = (category?: string) => {
    transitionTo('categories', () => {
      setSelectedCategory(category || '');
    });
  };

  const goToProduct = (product: string) => {
    transitionTo('product', () => {
      setSelectedProduct(product);
    });
  };

  const goHome = () => {
    transitionTo('home');
  };

  const goToCart = () => {
    transitionTo('cart');
  };

  const goToOrders = () => {
    transitionTo('orders');
  };

  const goBack = () => {
    if (currentScreen === 'cart' || currentScreen === 'orders') {
      if (previousScreen === 'product') {
        goToProduct(selectedProduct);
      } else if (previousScreen === 'categories') {
        goToCategories(selectedCategory);
      } else {
        goHome();
      }
    }
  };

  const toggleProfile = () => {
    setShowProfile(prev => !prev);
  };

  const contentStyle = {
    paddingTop: 'var(--telegram-header-padding)',
    transition: 'padding-top 0.3s ease'
  };

  // Сбрасываем номер заказа после отображения
  useEffect(() => {
    if (newOrderNumber && currentScreen === 'orders') {
      const timer = setTimeout(() => setNewOrderNumber(undefined), 500);
      return () => clearTimeout(timer);
    }
  }, [newOrderNumber, currentScreen]);

  return (
    <div style={contentStyle} className="h-screen bg-black">
      {/* Градиентный оверлей для верхней части Telegram WebApp */}
      {isFullScreenEnabled && typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp && (
        <div 
          className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
          style={{
            height: `${telegramHeaderPadding}px`,
            background: 'var(--telegram-header-gradient)'
          }}
        ></div>
      )}
      <div className={`h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {currentScreen === 'home' && (
          <HomeScreen 
            onCategoryClick={goToCategories} 
            onMenuClick={goToCategories} 
            onCartClick={goToCart} 
            onProfileClick={toggleProfile}
            onLogoClick={goHome}
            onOrdersClick={goToOrders}
            cartItemCount={cartItemCount}
            showCart={cartItems.length > 0}
          />
        )}
        {currentScreen === 'categories' && (
          <CategoriesScreen 
            selectedCategory={selectedCategory} 
            onProductClick={goToProduct} 
            onHomeClick={goHome} 
            onCartClick={goToCart}
            onProfileClick={toggleProfile}
            onLogoClick={goHome}
            onOrdersClick={goToOrders}
            cartItemCount={cartItemCount}
            showCart={cartItems.length > 0}
          />
        )}
        {currentScreen === 'product' && (
          <ProductScreen 
            productName={selectedProduct} 
            onBackClick={() => goToCategories(selectedCategory)} 
            onCartClick={goToCart}
            onProfileClick={toggleProfile}
            onLogoClick={goHome}
            onAddToCart={(id, quantity) => {
              addToCart(id, quantity);
              goToCart();
            }}
            showCart={cartItems.length > 0}
          />
        )}
        {currentScreen === 'cart' && (
          <CartScreen 
            onBackClick={goBack}
            onOrderComplete={(orderNumber) => {
              resetCartAndSetOrder(orderNumber);
              goHome();
            }}
          />
        )}
        {currentScreen === 'orders' && (
          <OrdersScreen 
            onBackClick={goBack}
            newOrderNumber={newOrderNumber}
          />
        )}
      </div>

      {showProfile && (
        <ProfileScreen 
          onClose={toggleProfile} 
          onHomeClick={goHome}
          onCartClick={goToCart}
          onOrdersClick={goToOrders}
        />
      )}
    </div>
  );
}

export default function SurfPage() {
  return (
    <TelegramProvider>
      <SurfApp />
    </TelegramProvider>
  );
} 