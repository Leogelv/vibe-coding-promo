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
  
  const { isFullScreenEnabled, webApp, telegramHeaderPadding, initializeTelegramApp } = useTelegram();

  useEffect(() => {
    // Инициализация Telegram WebApp при загрузке компонента
    if (webApp) {
      initializeTelegramApp();
    } else {
      // Если WebApp еще не доступен, попробуем через небольшую задержку
      const timer = setTimeout(() => {
        initializeTelegramApp();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [webApp, initializeTelegramApp]);

  // Устанавливаем CSS-переменную для отступа в зависимости от режима фулскрин
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--telegram-header-padding', 
        isFullScreenEnabled ? `${telegramHeaderPadding}px` : '0px'
      );
      // Добавляем стиль для верхнего градиента в Telegram
      if (isFullScreenEnabled) {
        document.documentElement.style.setProperty(
          '--telegram-header-gradient',
          'linear-gradient(to bottom, #1D1816 0%, #1D1816 70%, rgba(29, 24, 22, 0) 100%)'
        );
      } else {
        document.documentElement.style.setProperty(
          '--telegram-header-gradient',
          'none'
        );
      }
    }
  }, [isFullScreenEnabled, telegramHeaderPadding]);

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

  return (
    <div style={contentStyle} className="h-screen bg-black">
      {/* Градиентный оверлей для верхней части Telegram WebApp */}
      {isFullScreenEnabled && (
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
          />
        )}
        {currentScreen === 'product' && (
          <ProductScreen 
            productName={selectedProduct} 
            onBackClick={() => goToCategories(selectedCategory)} 
            onCartClick={goToCart}
            onProfileClick={toggleProfile}
            onLogoClick={goHome}
          />
        )}
        {currentScreen === 'cart' && (
          <CartScreen 
            onBackClick={goBack}
          />
        )}
        {currentScreen === 'orders' && (
          <OrdersScreen 
            onBackClick={goBack}
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