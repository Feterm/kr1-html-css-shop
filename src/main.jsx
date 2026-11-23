import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Boxes, Cable, Check, ChevronRight, Drill, GitCompareArrows, Hammer, HardHat, Heart, MapPin, Menu, MessageCircle, Moon, PaintRoller, Package, Search, Send, ShoppingCart, Star, Sun, Truck, UserRound, X } from 'lucide-react';
import { categories, products, money, matches, normalize } from './data';
import { About, address, Contacts, ExtraHome, LocalAccount, RequestDialog, ReviewStats, Schedule, Services, SiteFooter, StoreClock, dayKey, isPastSlot, services, slots, timeLeft } from './StoreExtras';
import { AccountTools, CatalogCategories, ComparisonGuide, DeliveryGuide, FavoritesCollections, MaterialCalculator, ProductGuide } from './ShoppingLayouts';
import { RouteChapters } from './RouteChapters';
import { createProductSummary, getProductStatus } from './product-functions';
import './style.css';
import './practice-console';

const categoryIcons = [Drill, Boxes, Hammer, HardHat, PaintRoller, Cable];
const sections = {home:'Главная', catalog:'Каталог', schedule:'График получения', services:'Услуги', about:'О магазине', contacts:'Контакты', favorites:'Избранное', compare:'Сравнение', account:'Личный кабинет', cart:'Корзина', checkout:'Оформление заказа'};
const tips = ['Подобрать товар', 'Условия доставки', 'Проверить наличие'];
const asset = name => import.meta.env.BASE_URL + 'store-assets/' + name;
const route = () => location.hash.slice(1) || 'home';
const go = page => { location.hash = page; };
const byId = id => products.find(product => product.id === Number(id));

function useStored(key, initial) {
  const [value, set] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stroybaza-' + key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem('stroybaza-' + key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, set];
}

function ProductImage({ product }) {
  return <img src={asset('responsive/product-' + product.id + '-480.webp')}
    srcSet={asset('responsive/product-' + product.id + '-240.webp') + ' 240w, ' +
      asset('responsive/product-' + product.id + '-480.webp') + ' 480w'}
    sizes="(max-width: 420px) 45vw, (max-width: 760px) 48vw, (max-width: 1000px) 30vw, 280px"
    width="480" height="480" alt={product.name} loading="lazy" />;
}

function App() {
  const [serverCalculation, setServerCalculation] = useState(null);
  const [calculationError, setCalculationError] = useState('');
  const [page, setPage] = useState(route);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useStored('dark', false);
  const [favorites, setFavorites] = useStored('favorites', []);
  const [comparison, setComparison] = useStored('comparison', []);
  const [recent, setRecent] = useStored('recent', []);
  const [cart, setCart] = useStored('cart', {});
  const [orders, setOrders] = useStored('orders', []);
  const [users, setUsers] = useStored('users', []);
  const [session, setSession] = useStored('session', '');
  const [requests, setRequests] = useStored('requests', []);
  const [subscriptions, setSubscriptions] = useStored('subscriptions', []);
  const [serviceReviews, setServiceReviews] = useStored('service-reviews', {});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [request, setRequest] = useState(null);
  const [requestError, setRequestError] = useState('');
  const [themePulse, setThemePulse] = useState(0);
  const requestDialog = useRef(null);
  const [profile, setProfile] = useStored('profile', '');
  const [reviews, setReviews] = useStored('reviews', {});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('popular');
  const [notice, setNotice] = useState('');
  const [delivery, setDelivery] = useState('pickup');
  const [chatOpen, setChatOpen] = useState(false);
  const [chat, setChat] = useStored('chat', []);
  const [message, setMessage] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const searchDialog = useRef(null);
  const chatLog = useRef(null);
  const [section, rawId] = page.split('/');
  const user = users.find(entry => entry.email === session);
  const accountOrders = orders.filter(order => user ? !order.email || order.email === user.email : !order.email);
  const accountRequests = requests.filter(entry => user ? !entry.email || entry.email === user.email : !entry.email);
  const activeProduct = section === 'product' ? byId(rawId) : undefined;

  useEffect(() => {
    function syncRoute() {
      searchDialog.current?.close();
      setPage(route());
      setMenuOpen(false);
      window.scrollTo(0, 0);
    }
    addEventListener('hashchange', syncRoute);
    return () => removeEventListener('hashchange', syncRoute);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  useEffect(() => {
    document.title = (activeProduct?.name || sections[section] || 'Страница не найдена') + ' — СтройБаза';
    if (activeProduct) setRecent(list => [activeProduct.id, ...list.filter(id => id !== activeProduct.id)].slice(0, 4));
  }, [section, activeProduct, setRecent]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('entered');
        observer.unobserve(entry.target);
      });
    }, {threshold:.13});
    document.querySelectorAll('main .block, main .product-card').forEach(node => {
      if (!node.classList.contains('entered') && node.getBoundingClientRect().top > innerHeight) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [page, category, query, maxPrice, availableOnly, sort]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 2400);
    return () => clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    if (chatLog.current) chatLog.current.scrollTop = chatLog.current.scrollHeight;
  }, [chat, chatOpen]);

  function stock(product) {
    const sold = orders.reduce((sum, order) => sum + order.items.reduce((n, item) => n + (item.id === product.id ? item.quantity : 0), 0), 0);
    return Math.max(0, product.stock - sold);
  }
  const remainingForActive = activeProduct ? stock(activeProduct) : 0;
  useEffect(() => {
    if (!activeProduct || !import.meta.env.VITE_API_URL) return;
    const controller = new AbortController();
    setCalculationError('');
    fetch(import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/calculate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      signal: controller.signal,
      body: JSON.stringify({
        name: activeProduct.name,
        price: activeProduct.oldPrice || activeProduct.price,
        discountPercent: activeProduct.discountPercent,
        stock: remainingForActive,
        isAvailable: activeProduct.isAvailable,
      }),
    }).then(async response => {
      if (!response.ok) throw new Error('Calculation failed');
      const data = await response.json();
      if (typeof data.summary !== 'string') throw new Error('Invalid response');
      if (!controller.signal.aborted) setServerCalculation({id: activeProduct.id, stock: remainingForActive, summary: data.summary});
    }).catch(error => {
      if (error.name !== 'AbortError') setCalculationError('Расчёт временно недоступен.');
    });
    return () => controller.abort();
  }, [activeProduct, remainingForActive]);
  const cartItems = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = byId(id);
    return product && quantity > 0 ? [{product, quantity}] : [];
  });
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, {product, quantity}) => sum + product.price * quantity, 0);
  const shipping = delivery === 'delivery' && subtotal < 10000 ? 490 : 0;
  const canOrder = cartItems.length > 0 && cartItems.every(({product, quantity}) => quantity <= stock(product));

  function setQuantity(product, quantity) {
    setCart(current => {
      const next = {...current};
      if (quantity <= 0) delete next[product.id];
      else next[product.id] = Math.min(quantity, stock(product));
      return next;
    });
  }
  function add(product) {
    if ((cart[product.id] || 0) >= stock(product)) return setNotice('Достигнут доступный остаток');
    setQuantity(product, (cart[product.id] || 0) + 1);
    setNotice('Товар добавлен в корзину');
  }
  function toggleFavorite(product) {
    setFavorites(list => list.includes(product.id) ? list.filter(id => id !== product.id) : [...list, product.id]);
  }
  function toggleCompare(product) {
    if (!comparison.includes(product.id) && comparison.length === 3) return setNotice('Можно сравнить до трёх товаров');
    setComparison(list => list.includes(product.id) ? list.filter(id => id !== product.id) : [...list, product.id]);
  }
  function openCatalog(chosen = '') {
    setCategory(chosen); setQuery(''); setMaxPrice(''); setAvailableOnly(false); setSort('popular'); go('catalog');
  }
  function submitOrder(event) {
    event.preventDefault();
    if (!canOrder) return setNotice('Проверьте остатки в корзине');
    const form = new FormData(event.currentTarget);
    if (String(form.get('phone')).replace(/\D/g, '').length < 7) return setNotice('Введите корректный номер телефона');
    if (!fulfillmentAvailable(delivery, selectedDate, selectedSlot)) return setNotice('Выберите доступный интервал получения');
    const order = {
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU'),
      items: cartItems.map(({product, quantity}) => ({id: product.id, name: product.name, quantity, price: product.price})),
      total: subtotal + shipping, delivery, email: user?.email,
      fulfillmentDate: form.get('fulfillment-date'), fulfillmentSlot: form.get('fulfillment-slot'),
    };
    setOrders(list => [order, ...list]);
    setProfile(String(form.get('name')).trim());
    setCart({});
    go('account');
    setNotice('Заказ оформлен');
  }
  function fulfillmentAvailable(method, date, slot) {
    return Boolean(date && slot && date >= dayKey() && slots.includes(slot) && !isPastSlot(date,slot) && timeLeft(orders,method,date,slot));
  }

  function chooseSlot(method, date, slot) {
    setDelivery(method); setSelectedDate(date); setSelectedSlot(slot);
    if (cartCount) go('checkout');
    else { go('catalog'); setNotice('Интервал выбран. Добавьте товары в корзину'); }
  }

  function openRequest(item, kind) {
    setRequest({id:item.id, name:item.name ?? item.title, kind});
    setRequestError('');
    requestDialog.current.showModal();
  }

  function submitRequest(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    if (name.length < 2) return setRequestError('Укажите имя.');
    const id = Date.now();
    if (request.kind === 'product') {
      const product = byId(request.id);
      const quantity = Number(form.get('quantity'));
      const date = form.get('date');
      const slot = form.get('slot');
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > stock(product)) return setRequestError('Проверьте доступное количество.');
      if (!fulfillmentAvailable('pickup',date,slot)) return setRequestError('Выберите свободный интервал самовывоза.');
      setOrders(list => [{id, date:new Date().toLocaleString('ru-RU'), email:user?.email, items:[{id:product.id,name:product.name,quantity,price:product.price}], total:product.price*quantity, delivery:'pickup', fulfillmentDate:date, fulfillmentSlot:slot}, ...list]);
    } else {
      const comment = String(form.get('comment')).trim();
      if (!comment) return setRequestError('Опишите, какая помощь нужна.');
      setRequests(list => [{id, title:request.name, name, comment, email:user?.email}, ...list]);
    }
    requestDialog.current.close();
    go('account');
    setNotice(request.kind === 'product' ? 'Товар забронирован' : 'Заявка сохранена в кабинете');
  }

  function subscribe(event) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email')).trim().toLowerCase();
    if (subscriptions.includes(email)) return setNotice('Этот адрес уже сохранён');
    setSubscriptions(list => [...list,email]);
    event.currentTarget.reset();
    setNotice('Адрес для предложений сохранён в браузере');
  }

  function submitReview(event, serviceId) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = String(form.get('body')).trim();
    if (!body) return;
    const entry = {name: String(form.get('author')).trim() || 'Покупатель', stars: Number(form.get('stars')), body, id: Date.now()};
    const id = serviceId ?? activeProduct.id;
    const save = serviceId ? setServiceReviews : setReviews;
    save(all => ({...all, [id]: [...(all[id] || []), entry]}));
    event.currentTarget.reset();
    setNotice('Отзыв добавлен');
  }
  function replyTo(text) {
    const cleaned = normalize(text);
    if (/достав|самовывоз/.test(cleaned)) return 'Самовывоз бесплатный. Доставка — 490 ₽, при покупке от 10 000 ₽ бесплатно. Способ можно выбрать в корзине.';
    const words = cleaned.match(/[а-яa-z0-9]{3,}/g) || [];
    const suggested = products.filter(p => words.some(word => normalize(p.name + ' ' + p.category).includes(word))).slice(0, 3);
    if (suggested.length) return suggested.map(p => p.name + ' — ' + money(p.price) + ', в наличии ' + stock(p) + ' шт.').join('\n');
    if (/налич/.test(cleaned)) return 'Напишите название товара, например «цемент» или «дрель». Я проверю текущий остаток.';
    return 'Напишите название товара или задачу. Например: «саморезы», «краска для стен» или «доставка».';
  }
  function send(text) {
    if (!text.trim()) return;
    const question = text.trim();
    setChat(list => [...list.slice(-49), {question, answer: replyTo(question)}]);
    setMessage('');
  }

  const listed = products.filter(p => (!category || p.category === category) && matches(p, query) &&
    (!maxPrice || p.price <= Number(maxPrice)) && (!availableOnly || stock(p) > 0));
  if (sort === 'low') listed.sort((a,b) => a.price - b.price);
  if (sort === 'high') listed.sort((a,b) => b.price - a.price);
  if (sort === 'rating') listed.sort((a,b) => b.rating - a.rating);
  if (sort === 'stock') listed.sort((a,b) => stock(b) - stock(a));

  function card(product) {
    const remaining = stock(product);
    return <article className="product-card" key={product.id}>
      <div className="product-media">
        <a href={'#product/' + product.id} aria-label={product.name}><ProductImage product={product}/></a>
        {product.oldPrice > product.price && <span className="sale">−{Math.round((1-product.price/product.oldPrice)*100)}%</span>}
        <button className={'wish ' + (favorites.includes(product.id) ? 'selected' : '')} aria-label={'Избранное: ' + product.name} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product)}><Heart size={19}/></button>
      </div>
      <div className="product-info">
        <div className="product-meta"><span>{product.category}</span><span><Star size={14} fill="currentColor"/> {product.rating}</span></div>
        <a className="product-title" href={'#product/' + product.id}>{product.name}</a>
        <small>{product.spec}</small>
        <div className="price">{money(product.price)} {product.oldPrice > 0 && <del>{money(product.oldPrice)}</del>}</div>
        <span className={'stock ' + (remaining ? '' : 'soldout')}>{getProductStatus(product, remaining)}{remaining > 0 && ': ' + remaining + ' шт.'}</span>
        <div className="card-actions"><button className="primary" disabled={!remaining} onClick={() => add(product)}><ShoppingCart size={17}/> В корзину</button><button className={'outline ' + (comparison.includes(product.id) ? 'selected' : '')} aria-label={'Сравнить: ' + product.name} aria-pressed={comparison.includes(product.id)} onClick={() => toggleCompare(product)}><GitCompareArrows size={18}/></button></div>
        {section === 'catalog' && <button className="text-button" disabled={!remaining} onClick={() => openRequest(product,'product')}>Быстрый резерв</button>}
      </div>
    </article>;
  }
  const grid = list => <div className="product-grid">{list.map(card)}</div>;
  const empty = (text) => <div className="empty"><Package size={34}/><p>{text}</p><button className="primary" onClick={() => openCatalog()}>Открыть каталог</button></div>;
  const home = section === 'home';

  return <>
    <a className="skip" href="#main" onClick={event => {event.preventDefault(); document.getElementById('main').focus();}}>К содержимому</a>
    <div className="utility"><div className="wrap utility-inner"><span><MapPin size={14}/> Москва</span><StoreClock/><a href="#contacts">Доставка и самовывоз</a><a href="#contacts" className="utility-right">Контакты магазина</a></div></div>
    <header>
      <div className="wrap bar">
        <a className="brand" href="#home"><span className="brand-icon"><Hammer size={23}/></span><span>СТРОЙ<span>БАЗА</span><small>СТРОИТЕЛЬНЫЙ МАГАЗИН</small></span></a>
        <button className="catalog-button primary" onClick={() => openCatalog()}><Menu size={19}/> Каталог</button>
        <button className="search-launch" onClick={() => searchDialog.current.showModal()}><Search size={20}/><span>Поиск по товарам и сайту</span><span className="search-key">Найти</span></button>
        <div className="header-actions">
          <button className="icon-button theme-button" aria-label={dark ? 'Светлая тема' : 'Тёмная тема'} aria-pressed={dark} onClick={() => {setDark(!dark); setThemePulse(value => value + 1);}}>
            <Sun className="theme-sun" size={22}/><Moon className="theme-moon" size={22}/>
          </button>
          <a className="icon-button" href="#compare" aria-label={'Сравнение: ' + comparison.length}><GitCompareArrows size={22}/>{comparison.length > 0 && <b>{comparison.length}</b>}</a>
          <a className="icon-button" href="#favorites" aria-label={'Избранное: ' + favorites.length}><Heart size={22}/>{favorites.length > 0 && <b>{favorites.length}</b>}</a>
          <a className="icon-button" href="#account" aria-label="Личный кабинет"><UserRound size={22}/></a>
          <a className="icon-button" href="#cart" aria-label={'Корзина: ' + cartCount}><ShoppingCart size={22}/>{cartCount > 0 && <b>{cartCount}</b>}</a>
          <button className="icon-button mobile-menu" aria-label="Меню" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu size={22}/></button>
        </div>
      </div>
      <nav className={'wrap nav ' + (menuOpen ? 'nav-open' : '')} aria-label="Основное меню">
        {['home','schedule','catalog','services','about','contacts'].map(key => <a key={key} href={'#' + key} aria-current={section === key ? 'page' : undefined}>{sections[key]}</a>)}
        <button className="nav-chat" onClick={() => setChatOpen(true)}><MessageCircle size={16}/> Консультация</button>
      </nav>
    </header>
    <main key={page} className="wrap page-enter" id="main" data-route={page} tabIndex="-1">
      {home && <>
        <section className="hero">
          <div className="hero-copy"><span className="eyebrow">ДЛЯ РЕМОНТА И СТРОЙКИ</span><h1>Всё для ремонта<br/>и стройки</h1><p>Инструменты, крепёж и материалы<br className="wide-only"/> для работ дома и на объекте.</p><button className="primary" onClick={() => openCatalog()}>Перейти в каталог</button></div>
        </section>
        <div className="benefits">
          <div><Truck/><span><b>Доставка</b><small>Бесплатно от 10 000 ₽</small></span></div>
          <div><Package/><span><b>Самовывоз</b><small>Бесплатно со склада</small></span></div>
          <div><Check/><span><b>Остатки в каталоге</b><small>Видно до оформления</small></span></div>
          <button onClick={() => setChatOpen(true)}><MessageCircle/><span><b>Помощь с выбором</b><small>Задайте вопрос в чате</small></span></button>
        </div>
        <section className="block"><div className="heading"><h2>Категории</h2><button className="text-button" onClick={() => openCatalog()}>Весь каталог</button></div><div className="categories">{categories.map((name,i) => {
          const Icon = categoryIcons[i];
          return <button key={name} onClick={() => openCatalog(name)}><Icon size={26}/><strong>{name}</strong><small>{products.filter(p => p.category === name).length} в каталоге</small></button>;
        })}</div></section>
        <section className="block"><div className="heading"><h2>Популярные товары</h2><button className="text-button" onClick={() => openCatalog()}>Все товары</button></div>{grid(products.slice(0,4))}</section>
        {recent.length > 0 && <section className="block"><div className="heading"><h2>Недавно смотрели</h2><button className="text-button" onClick={() => setRecent([])}>Очистить</button></div>{grid(recent.map(byId).filter(Boolean))}</section>}
        <ExtraHome reviews={{...reviews,...serviceReviews}} subscribe={subscribe}/>
      </>}
      {!home && <div className="breadcrumbs"><a href="#home">Главная</a><ChevronRight size={15}/><span>{activeProduct ? <a href="#catalog">Каталог</a> : sections[section] || 'Страница не найдена'}</span>{activeProduct && <><ChevronRight size={15}/><span>{activeProduct.name}</span></>}</div>}
      {section === 'catalog' && <section><h1>Каталог товаров</h1><CatalogCategories selected={category} choose={setCategory}/>{recent.length > 0 && <section className="block catalog-recent"><div className="heading"><h2>Недавно смотрели</h2><button className="text-button" onClick={() => setRecent([])}>Очистить</button></div>{grid(recent.map(byId).filter(Boolean))}</section>}<div className="catalog-layout">
        <aside className="panel filters" aria-label="Фильтры"><h2>Фильтры</h2><label>Категория<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Все категории</option>{categories.map(name => <option key={name}>{name}</option>)}</select></label>
          <label>Цена до, ₽<input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Любая цена"/></label>
          <label className="check"><input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)}/> Только в наличии</label>
          <button className="outline" onClick={() => openCatalog()}>Сбросить фильтры</button>
        </aside>
        <div><div className="catalog-tools"><label>Поиск товаров<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Например, цемент"/></label><label>Сортировка<select value={sort} onChange={e => setSort(e.target.value)}><option value="popular">По популярности</option><option value="low">Сначала дешевле</option><option value="high">Сначала дороже</option><option value="rating">По рейтингу</option><option value="stock">По наличию</option></select></label></div>
          <p className="muted" role="status">Товаров: {listed.length}</p>{listed.length ? grid(listed) : <div className="panel">По этим условиям ничего не найдено.</div>}</div>
      </div></section>}
      {activeProduct && <section key={activeProduct.id}><div className="detail">
        <div className="detail-photo"><ProductImage product={activeProduct}/></div>
        <div><span className="eyebrow">{activeProduct.category}</span><h1>{activeProduct.name}</h1><p>{activeProduct.description}</p><p className="product-summary">{serverCalculation?.id === activeProduct.id && serverCalculation.stock === remainingForActive ? serverCalculation.summary : createProductSummary(activeProduct, remainingForActive)}</p><p className="price">{money(activeProduct.price)}</p>{calculationError && <p role="status">{calculationError}</p>}<p className="stock">{stock(activeProduct)} шт. в наличии</p>
          <div className="row"><button className="primary" onClick={() => add(activeProduct)} disabled={!stock(activeProduct)}><ShoppingCart size={19}/> В корзину</button><button className="outline" aria-pressed={favorites.includes(activeProduct.id)} onClick={() => toggleFavorite(activeProduct)}><Heart size={19}/> Избранное</button><button className="outline" aria-pressed={comparison.includes(activeProduct.id)} onClick={() => toggleCompare(activeProduct)}><GitCompareArrows size={19}/> Сравнить</button></div>
          <button className="text-button quick-detail" disabled={!stock(activeProduct)} onClick={() => openRequest(activeProduct,'product')}>Быстро забронировать для самовывоза</button><h2>Характеристики</h2><dl className="specs"><dt>Категория</dt><dd>{activeProduct.category}</dd><dt>Параметры</dt><dd>{activeProduct.spec}</dd><dt>Артикул</dt><dd>СБ-{String(activeProduct.id).padStart(4,'0')}</dd></dl></div>
      </div><div className="panel block reviews"><h2>Отзывы о товаре</h2><p>Оценка в каталоге: {activeProduct.rating} / 5</p><ReviewStats entries={reviews[activeProduct.id] || []}/>
        {(reviews[activeProduct.id] || []).map(entry => <article key={entry.id}><strong>{entry.name}</strong><p className="rating">{entry.stars} / 5</p><p>{entry.body}</p></article>)}
        <form className="form" onSubmit={event => submitReview(event)}><h3>Оставить отзыв</h3><label>Имя<input name="author" maxLength={60} required/></label><label>Оценка<select name="stars" defaultValue="5">{[5,4,3,2,1].map(n => <option key={n}>{n}</option>)}</select></label><label>Отзыв<textarea name="body" maxLength={800} required/></label><button className="primary">Добавить отзыв</button></form>
      </div></section>}
      {section === 'favorites' && <section><h1>Избранное</h1>{favorites.length ? grid(favorites.map(byId).filter(Boolean)) : empty('Здесь появятся товары, отмеченные сердечком.')}</section>}
      {section === 'compare' && <section><h1>Сравнение товаров</h1>{comparison.length ? <div className="panel table-scroll" tabIndex="0" role="region" aria-label="Таблица сравнения">
        <table><thead><tr><th scope="col">Параметр</th>{comparison.map(id => <th key={id} scope="col"><a href={'#product/' + id}>{byId(id).name}</a><button className="text-button" onClick={() => toggleCompare(byId(id))}>Убрать</button></th>)}</tr></thead><tbody>
          {[['Цена',p => money(p.price)],['Категория',p => p.category],['Характеристики',p => p.spec],['Рейтинг',p => p.rating],['Остаток',p => stock(p) + ' шт.']].map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{comparison.map(id => <td key={id}>{value(byId(id))}</td>)}</tr>)}
        </tbody></table></div> : empty('Выберите до трёх товаров в каталоге.')}</section>}
      {(section === 'cart' || section === 'checkout') && <section key={section}><h1>{sections[section]}</h1>{cartItems.length ? <div className="checkout-layout">
        {section === 'cart' ? <div className="panel cart-list">{cartItems.map(({product,quantity}) => <article key={product.id}><div className="cart-photo"><ProductImage product={product}/></div><div><a href={'#product/' + product.id}><strong>{product.name}</strong></a><p>{money(product.price)} · осталось {stock(product)} шт.</p><div className="row quantity"><button className="outline" aria-label={'Уменьшить количество: ' + product.name} onClick={() => setQuantity(product,quantity-1)}>−</button><span>{quantity}</span><button className="outline" aria-label={'Увеличить количество: ' + product.name} disabled={quantity >= stock(product)} onClick={() => setQuantity(product,quantity+1)}>+</button><button className="text-button" onClick={() => setQuantity(product,0)}>Удалить</button></div></div><strong>{money(quantity*product.price)}</strong></article>)}</div> :
          <form className="panel form" id="checkout-form" onSubmit={submitOrder}><h2>Данные покупателя</h2><label>Имя<input name="name" autoComplete="name" defaultValue={user?.name || profile} minLength={2} required/></label><label>Электронная почта<input name="email" autoComplete="email" type="email" defaultValue={user?.email} required/></label><label>Телефон<input name="phone" autoComplete="tel" type="tel" pattern="[+0-9 \(\)\-]{7,20}" title="Введите номер телефона: от 7 до 20 символов" required/></label><label>Получение<select value={delivery} onChange={event => {setDelivery(event.target.value);setSelectedSlot('');}}><option value="pickup">Самовывоз</option><option value="delivery">Доставка</option></select></label><label>Дата получения<input type="date" name="fulfillment-date" min={dayKey()} value={selectedDate} onChange={event => {setSelectedDate(event.target.value);setSelectedSlot('');}} required/></label><label>Интервал<select name="fulfillment-slot" value={selectedSlot} onChange={event => setSelectedSlot(event.target.value)} required><option value="">Выберите время</option>{slots.map(slot => <option key={slot} disabled={!fulfillmentAvailable(delivery,selectedDate,slot)}>{slot}</option>)}</select></label>{delivery === 'delivery' && <label>Адрес доставки<input name="address" autoComplete="street-address" required/></label>}<a className="text-button" href="#schedule">Проверить интервалы в графике</a></form>}
        <aside className="panel summary"><h2>Ваш заказ</h2><p>Товары ({cartCount}) <b>{money(subtotal)}</b></p>{section === 'checkout' && <p>Доставка <b>{money(shipping)}</b></p>}<p className="total">Итого <b>{money(subtotal + (section === 'checkout' ? shipping : 0))}</b></p>
          {section === 'cart' ? <button className="primary" disabled={!canOrder} onClick={() => go('checkout')}>Оформить заказ</button> : <button className="primary" disabled={!canOrder} form="checkout-form">Подтвердить заказ</button>}
          {!canOrder && <p className="muted">Количество некоторых товаров превышает остаток.</p>}</aside>
      </div> : empty('Ваша корзина пуста.')}</section>}
      {section === 'account' && <section><h1>Личный кабинет</h1><p>{user ? 'Здравствуйте, ' + user.name + '!' : profile ? 'Здравствуйте, ' + profile + '!' : 'Оформите заказ, чтобы он появился здесь.'}</p><div className="account-links"><a className="panel" href="#favorites"><Heart/>Избранное <strong>{favorites.length}</strong></a><a className="panel" href="#compare"><GitCompareArrows/>Сравнение <strong>{comparison.length}</strong></a><a className="panel" href="#cart"><ShoppingCart/>Корзина <strong>{cartCount}</strong></a></div><LocalAccount users={users} setUsers={setUsers} session={session} setSession={setSession} notify={setNotice}/><h2 className="block">История заказов</h2>
        {accountOrders.length ? accountOrders.map(order => <details className="panel order" key={order.id}><summary>Заказ №{String(order.id).slice(-8)} · {order.date} · {money(order.total)}</summary><p>{order.delivery === 'delivery' ? 'Доставка' : 'Самовывоз'}{order.fulfillmentDate && ' · ' + order.fulfillmentDate.split('-').reverse().join('.') + ' · ' + order.fulfillmentSlot}</p><ul>{order.items.map(item => <li key={item.id}><a href={'#product/' + item.id}>{item.name}</a> — {item.quantity} шт.</li>)}</ul></details>) : <p className="muted">Заказов пока нет.</p>}
        <section className="block"><h2>Заявки на услуги</h2>{accountRequests.length ? accountRequests.map(entry => <details className="panel order" key={entry.id}><summary>Заявка №{String(entry.id).slice(-8)} · {entry.title}</summary><p>{entry.comment}</p></details>) : <p className="muted">Заявок пока нет. <a className="text-button" href="#services">Посмотреть услуги</a></p>}</section>
        {favorites.length > 0 && <section className="block"><h2>Избранные товары</h2>{grid(favorites.map(byId).filter(Boolean))}</section>}
        {recent.length > 0 && <section className="block"><div className="heading"><h2>Недавно смотрели</h2><button className="text-button" onClick={() => setRecent([])}>Очистить</button></div>{grid(recent.map(byId).filter(Boolean))}</section>}
      </section>}
      {section === 'about' && <About openChat={() => setChatOpen(true)}/>}
      {section === 'contacts' && <Contacts openChat={() => setChatOpen(true)}/>}
      {section === 'schedule' && <Schedule orders={orders} onSlot={chooseSlot}/>}
      {section === 'services' && <Services selected={rawId} openRequest={service => openRequest(service,'service')} reviews={serviceReviews} saveReview={submitReview}/>}
      {activeProduct && <ProductGuide product={activeProduct}
        related={products.filter(product => product.id !== activeProduct.id && product.category === activeProduct.category).slice(0,3)}
        renderCard={card} reserve={stock(activeProduct) ? () => openRequest(activeProduct,'product') : undefined}/>}
      {section === 'favorites' && <FavoritesCollections favorites={favorites} choose={openCatalog}/>}
      {section === 'compare' && <ComparisonGuide count={comparison.length} choose={openCatalog}/>}
      {(section === 'cart' || section === 'checkout') && <DeliveryGuide checkout={section === 'checkout'} subtotal={subtotal} address={address}/>}
      {section === 'account' && <AccountTools orders={accountOrders} requests={accountRequests} recent={recent}/>}
      {section === 'services' && (!rawId || rawId === 'estimate') && <MaterialCalculator/>}
      <RouteChapters section={section} detail={rawId} product={activeProduct} remaining={activeProduct ? stock(activeProduct) : 0}/>
      {!sections[section] && !activeProduct && <section><h1>Страница не найдена</h1>{empty('Попробуйте вернуться к покупкам.')}</section>}
    </main>
    <SiteFooter openChat={() => setChatOpen(true)}/>
    <RequestDialog dialog={requestDialog} request={request} submit={submitRequest} max={request?.kind === 'product' ? stock(byId(request.id)) : 0} error={requestError}/>
    {themePulse > 0 && <div className="theme-pulse" key={themePulse} aria-hidden="true" onAnimationEnd={() => setThemePulse(0)}/>}
    <dialog ref={searchDialog} className="search-dialog" aria-labelledby="search-title"><div className="heading"><h2 id="search-title">Поиск по сайту</h2><button className="icon-button" onClick={() => searchDialog.current.close()} aria-label="Закрыть поиск"><X/></button></div><label>Поисковый запрос<input type="search" value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} placeholder="Название товара или раздела" autoFocus/></label>
      <div className="search-results">{globalSearch.trim() && <>
        {products.filter(p => matches(p,globalSearch)).map(p => <a key={p.id} href={'#product/' + p.id} onClick={() => searchDialog.current.close()}>{p.name}<strong>{money(p.price)}</strong></a>)}
        {Object.entries(sections).filter(([,label]) => normalize(label).includes(normalize(globalSearch))).map(([key,label]) => <a key={key} href={'#' + key} onClick={() => searchDialog.current.close()}>{label}<small>Раздел</small></a>)}
        {services.filter(item => normalize(item.title + ' ' + item.detail).includes(normalize(globalSearch))).map(item => <a key={item.id} href={'#services/' + item.id} onClick={() => searchDialog.current.close()}>{item.title}<small>Услуга</small></a>)}
        {!products.some(p => matches(p,globalSearch)) && !Object.values(sections).some(label => normalize(label).includes(normalize(globalSearch))) && !services.some(item => normalize(item.title + ' ' + item.detail).includes(normalize(globalSearch))) && <p className="muted">Ничего не найдено.</p>}
      </>}</div>
    </dialog>
    {chatOpen && <aside className="chat" aria-label="Чат с консультантом"><div className="chat-head"><div><strong>Консультант СтройБазы</strong><small>Автоматический помощник</small></div><button className="icon-button" aria-label="Закрыть чат" onClick={() => setChatOpen(false)}><X size={22}/></button></div><div className="chat-log" ref={chatLog} role="log"><p>Здравствуйте! Помогу найти товар, уточнить остатки и условия доставки.</p>{chat.map((entry,i) => <React.Fragment key={i}><p className="my-message">{entry.question}</p><p>{entry.answer}</p></React.Fragment>)}</div><div className="chat-tips">{tips.map(tip => <button className="outline" key={tip} onClick={() => send(tip)}>{tip}</button>)}</div><form className="chat-form" onSubmit={e => {e.preventDefault();send(message);}}><input aria-label="Сообщение" value={message} onChange={e => setMessage(e.target.value)} placeholder="Напишите вопрос" maxLength={350}/><button className="primary" aria-label="Отправить" disabled={!message.trim()}><Send size={18}/></button></form></aside>}
    {!chatOpen && <button className="chat-toggle primary" onClick={() => setChatOpen(true)} aria-label="Открыть чат с консультантом"><MessageCircle size={23}/><span>Чат</span></button>}
    <div className={notice ? 'toast' : 'visually-hidden'} role="status">{notice}</div>
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);

