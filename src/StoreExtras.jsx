import React, {useEffect, useRef, useState} from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Hammer, Mail, MapPin, Package, Phone, Truck, X } from 'lucide-react';
import { faqs, money } from './data';

export const address = 'Москва, Каширское шоссе, 19, корп. 1';
const mapQuery = encodeURIComponent(address);
const longitude = '37.631977';
const latitude = '55.664871';
const marker = longitude + ',' + latitude;
const mapFrame = 'https://yandex.ru/map-widget/v1/?ll=' + marker + '&z=17&pt=' + marker + ',pm2or' + '&text=' + mapQuery;
const mapRoute = 'https://yandex.ru/maps/?rtext=~' + mapQuery + '&rtt=auto';
const phone = '+7 (495) 000-18-00';
const email = 'info@stroybaza.example';
const callHours = 'Ежедневно, 09:00–21:00';
export const slots = ['09:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00'];
export const dayKey = (date = new Date()) => date.toLocaleDateString('sv-SE');
export const dateLabel = date => new Intl.DateTimeFormat('ru-RU', {weekday:'long', day:'numeric', month:'long'}).format(new Date(date + 'T12:00:00'));
export const timeLeft = (orders, method, date, slot) => Math.max(0, (method === 'delivery' ? 4 : 8) -
  orders.filter(order => order.delivery === method && order.fulfillmentDate === date && order.fulfillmentSlot === slot).length);
export const isPastSlot = (date, slot, now = new Date()) => new Date(date + 'T' + slot.split('–')[1] + ':00') <= now;

export const services = [
  {id:'estimate', title:'Расчёт материалов', price:0, detail:'Рассчитаем расход смесей, краски и крепежа по размерам помещения. Подготовьте длину, ширину и высоту, число проёмов и планируемое число слоёв.'},
  {id:'delivery', title:'Доставка на объект', price:490, detail:'Подберите дату и интервал. Для тяжёлых и габаритных товаров заранее уточните возможность заезда, место разгрузки и наличие грузового лифта.'},
  {id:'reserve', title:'Сборка и резерв заказа', price:0, detail:'Соберём позиции в один заказ к выбранному интервалу. На выдаче понадобится номер заказа, который появится в личном кабинете.'},
  {id:'cut', title:'Распил в размер', price:150, detail:'Подготовьте список деталей в миллиметрах с указанием количества и направления волокон. Начальная цена указана за один прямой рез.'},
  {id:'selection', title:'Подбор инструмента', price:0, detail:'Уточним материал, объём работ и нужные насадки. Поможем сравнить модели и подобрать расходники, которые подходят к инструменту.'},
  {id:'business', title:'Комплектация для бригад', price:0, detail:'Соберём перечень материалов по этапам и подберём аналоги по характеристикам. В заявку можно приложить список позиций текстом.'},
];

const generalFaq = [...faqs,
  ['Можно ли изменить дату получения?', 'Откройте историю заказов и проверьте номер. Уточнить перенос можно в чате или по контактам магазина.'],
  ['Как уточнить условия возврата?', 'Сохраните номер заказа, упаковку и комплектность. По вопросам возврата обратитесь в раздел «Контакты».'],
];

export function Faq({items = generalFaq, title = 'Частые вопросы'}) {
  const group = React.useId();
  return <section className="block faq-section"><h2>{title}</h2>{items.map(([question, answer]) =>
    <details name={group} className="panel order" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>;
}

function Brand() {
  return <a className="brand" href="#home"><span className="brand-icon"><Hammer size={23}/></span><span>СТРОЙ<span>БАЗА</span><small>СТРОИТЕЛЬНЫЙ МАГАЗИН</small></span></a>;
}

const mainLinks = [['home','Главная'],['schedule','График получения'],['catalog','Каталог'],['services','Услуги'],['about','О магазине']];
const purchaseLinks = [['favorites','Избранное'],['compare','Сравнение'],['cart','Корзина'],['checkout','Оформление заказа'],['account','Личный кабинет']];

function FooterLinks({links}) {
  return <ul>{links.map(([id,label]) => <li key={id}><a href={'#' + id}>{label}</a></li>)}</ul>;
}

function ContactLinks({showCallHours = false}) {
  return <ul className="contact-links">
    <li><MapPin size={18}/><a href={mapRoute} target="_blank" rel="noreferrer">{address}</a></li>
    <li><Phone size={18}/><a href="tel:+74950001800">{phone}</a></li>
    {showCallHours && <li className="footer-call-hours"><Clock3 size={18}/><span>Звонки: {callHours.toLowerCase()}</span></li>}
    <li><Mail size={18}/><a href={'mailto:' + email}>{email}</a></li>
  </ul>;
}

export function SiteFooter({openChat}) {
  return <footer className="site-footer"><div className="wrap">
    <div className="footer-columns">
      <section><Brand/><p>Инструменты, крепёж и материалы для дома, мастерской и стройки.</p><button className="footer-chat" onClick={openChat}>Написать консультанту</button></section>
      <nav aria-label="Навигация в подвале"><h2>Навигация</h2><FooterLinks links={mainLinks}/></nav>
      <nav aria-label="Покупателям"><h2>Покупателям</h2><FooterLinks links={purchaseLinks}/></nav>
      <section><h2>Контакты</h2><ContactLinks showCallHours/><a className="footer-map" href={mapRoute} target="_blank" rel="noreferrer"><MapPin size={18}/> Построить маршрут</a></section>
    </div><div className="footer-bottom"><span>© 2026 СтройБаза. Все права защищены.</span><a href="#home">На главную</a></div>
  </div></footer>;
}

export function StoreClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);
  return <time className="store-clock" dateTime={now.toISOString()} title="Время в Москве">{now.toLocaleTimeString('ru-RU', {timeZone:'Europe/Moscow', hour:'2-digit', minute:'2-digit'})} МСК</time>;
}

export function Contacts({openChat}) {
  return <section><h1>Доставка и контакты</h1><div className="map-layout">
    <div className="contact-panel panel"><h2>СтройБаза в Москве</h2><ContactLinks/><p><Clock3 size={18}/> Ежедневно, 09:00–21:00</p><a className="primary" href={mapRoute} target="_blank" rel="noreferrer">Маршрут в Яндекс Картах</a></div>
    <iframe className="store-map" title={'Яндекс Карты — ' + address} src={mapFrame} loading="lazy" allowFullScreen/>
  </div><section className="block"><h2>Как подготовиться к получению</h2><div className="info-grid">
    <article className="panel"><Package/><h3>Самовывоз</h3><p>Возьмите номер заказа. Если покупка тяжёлая, заранее освободите место в машине и подготовьте крепления.</p><a className="text-button" href="#schedule">Посмотреть график выдачи</a></article>
    <article className="panel"><Truck/><h3>Доставка</h3><p>490 ₽, бесплатно при заказе от 10 000 ₽. При оформлении укажите адрес и удобный интервал.</p><a className="text-button" href="#services/delivery">Подробнее о доставке</a></article>
    <article className="panel"><Phone/><h3>Вопросы и предложения</h3><p>Уточните комплектацию, условия разгрузки или статус заказа.</p><button className="text-button" onClick={openChat}>Написать в чат</button></article>
  </div></section><Faq/></section>;
}

export function About({openChat}) {
  return <section><div className="page-banner company-hero"><span className="eyebrow">О КОМПАНИИ</span><h1>СтройБаза</h1><p>Строительные материалы и инструмент для ремонта своими руками и работы на объекте.</p></div>
    <section className="block panel editorial"><h2>От списка материалов до выдачи</h2><p>Ассортимент собран по задачам: подготовка основания, крепление, отделка и подключение инструмента. У каждой позиции есть характеристики, цена и остаток, чтобы проще планировать покупку.</p><p>При заказе можно заранее подобрать интервал получения. Если задача требует уточнения размеров или расхода, начните с консультации.</p></section>
    <section className="block"><h2>Как мы помогаем с ремонтом</h2><div className="brand-timeline">
      <article className="panel"><Hammer/><h3>Подбираем по параметрам</h3><p>Для крепежа важны материал основания и нагрузка, для отделки — площадь и состояние поверхности. Сравните подходящие позиции в каталоге.</p></article>
      <article className="panel"><Package/><h3>Готовим к получению</h3><p>Выберите доставку на объект или заберите собранный заказ в пункте выдачи. Состав и номер доступны в истории заказов.</p></article>
      <article className="panel"><Truck/><h3>Работаем со списками бригад</h3><p>Подготовьте объёмы, размеры и этапы работ. Разобьём закупку на партии и предложим подходящие позиции по списку.</p></article>
    </div></section><section className="block callout"><h2>Начните с вашей задачи</h2><p>Возьмите размеры помещения или список работ. С ними проще подобрать материалы и посчитать запас.</p><div className="row"><a className="primary" href="#catalog">Открыть каталог</a><button className="outline" onClick={openChat}>Задать вопрос</button></div></section></section>;
}

export function Schedule({orders, onSlot}) {
  const [method,setMethod] = useState('pickup');
  const dates = Array.from({length:7}, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() + index); return dayKey(date);
  });
  const [chosen,setChosen] = useState(dates[0]);
  return <section><div className="page-banner"><h1>График получения</h1><p>Выберите день и интервал самовывоза или доставки.</p></div>
    <section className="block panel schedule"><h2>Доступные интервалы</h2>
      <div className="row" aria-label="Способ получения">{[['pickup','Самовывоз'],['delivery','Доставка']].map(([id,label]) => <button className="outline" aria-pressed={method===id} key={id} onClick={() => setMethod(id)}>{label}</button>)}</div>
      <div className="schedule-days" aria-label="Дни недели">{dates.map(date => <button className="outline" aria-pressed={chosen===date} key={date} onClick={() => setChosen(date)}><CalendarDays size={17}/>{dateLabel(date)}</button>)}</div>
      <div className="slots">{slots.map(slot => {
        const remaining = isPastSlot(chosen,slot) ? 0 : timeLeft(orders,method,chosen,slot);
        return <article className="panel" key={slot}><b>{slot}</b><small>{remaining ? 'Свободно: ' + remaining : 'Недоступно'}</small><button className="primary" disabled={!remaining} onClick={() => onSlot(method,chosen,slot)}>Выбрать</button></article>;
      })}</div>
    </section><section className="block"><h2>Получение без лишних поездок</h2><div className="info-grid"><article className="panel"><h3>Уточните остаток</h3><p>Перед оформлением проверьте количество всех позиций в корзине.</p><a className="text-button" href="#catalog">Каталог товаров</a></article><article className="panel"><h3>Подготовьте номер заказа</h3><p>Номер и время получения можно посмотреть в личном кабинете.</p><a className="text-button" href="#account">История заказов</a></article><article className="panel"><h3>Спланируйте маршрут</h3><p>{address}</p><a className="text-button" href="#contacts">Контакты и карта</a></article></div></section><Faq title="Если планы изменились" items={generalFaq.slice(3,4)}/></section>;
}

export function ReviewStats({entries}) {
  if (!entries.length) return null;
  const average = entries.reduce((total, review) => total + review.stars, 0) / entries.length;
  return <div className="review-summary"><div><strong>{average.toFixed(1).replace('.', ',')} / 5</strong><p>{entries.length} оценок</p></div><div>{[5,4,3,2,1].map(stars => {
    const count = entries.filter(entry => entry.stars === stars).length;
    return <div className="review-bar" key={stars}><span>{stars} ★</span><meter min="0" max={entries.length} value={count} aria-label={'Оценок на ' + stars}/><span>{count}</span></div>;
  })}</div></div>;
}

export function Services({selected, openRequest, reviews, saveReview}) {
  const service = services.find(item => item.id === selected);
  const entries = service ? reviews[service.id] || [] : [];
  return <section><div className="page-banner service-banner"><h1>{service ? service.title : 'Услуги для ремонта и стройки'}</h1><p>{service ? service.detail : 'От расчёта материалов до доставки на объект и комплектации для бригад.'}</p></div>
    {service ? <section className="block panel"><div className="heading"><h2>{service.price ? 'От ' + money(service.price) : 'Бесплатно'}</h2><button className="primary" onClick={() => openRequest(service)}>Оставить заявку</button></div><h2>Отзывы об услуге</h2><ReviewStats entries={entries}/>{entries.length ? entries.map(entry => <article className="service-review" key={entry.id}><strong>{entry.name} · {entry.stars} / 5</strong><p>{entry.body}</p></article>) : <p className="muted">Отзывов пока нет.</p>}
      <form className="form review-form" onSubmit={event => saveReview(event, service.id)}><label>Имя<input name="author" required maxLength="60"/></label><label>Оценка<select name="stars">{[5,4,3,2,1].map(stars => <option key={stars}>{stars}</option>)}</select></label><label>Отзыв<textarea name="body" required maxLength="800"/></label><button className="outline">Добавить отзыв</button></form></section> :
      <section className="block info-grid">{services.map(item => <article className="panel service-card" key={item.id}><Package/><h2><a href={'#services/' + item.id}>{item.title}</a></h2><p>{item.detail}</p><div className="row"><a className="text-button" href={'#services/' + item.id}>Подробнее и отзывы</a><button className="outline" onClick={() => openRequest(item)}>Оставить заявку</button></div></article>)}</section>}
    <section className="block callout"><h2>Что приложить к заявке</h2><p>Укажите нужную услугу, сроки, размеры и предполагаемый объём работ. Для доставки добавьте адрес и особенности подъезда.</p><a className="outline" href={service ? '#services' : '#contacts'}>{service ? 'Все услуги' : 'Как связаться'}</a></section></section>;
}

const reviewExamples = [
  ['Дрель-шуруповёрт', 5, 'Собрал два шкафа на одном заряде. Вторая батарея пригодилась на следующий день, когда сверлил отверстия под крепления.'],
  ['Подбор крепежа', 5, 'Сверили длину саморезов с толщиной досок. Получилось собрать полки без выступающих концов.'],
  ['Самовывоз', 5, 'Выбрал интервал после работы. По номеру заказа выдали обе коробки, состав проверил на месте.'],
  ['Расчёт краски', 4, 'Посчитали расход на два слоя. На стене с ярким старым цветом понадобился ещё один слой, хорошо, что взял с запасом.'],
  ['Удлинитель на катушке', 5, 'Кабеля хватило от гаража до верстака. Катушку удобно сматывать после работы.'],
  ['Распил в размер', 5, 'Передал список деталей для стеллажа. При сборке все полки встали на место без подгонки.'],
  ['Доставка на объект', 4, 'Указал, через какие ворота заезжать. По времени всё подошло, но место для разгрузки лучше подготовить заранее.'],
  ['Монтажные перчатки', 5, 'Сухую доску держать удобно, ладони не скользят. На мою руку подошёл размер L.'],
  ['Цемент М500', 5, 'Мешки были сухими, без комков. Взял небольшую партию, чтобы не хранить остаток до следующего ремонта.'],
  ['Разводной ключ', 4, 'Подошёл для гаек разного размера при сборке верстака. Для тесного пространства под раковиной удобнее короткий ключ.'],
].map(([topic,stars,body]) => ({topic,stars,body,name:'Пример отзыва'}));

function ReviewCarousel({reviews}) {
  const [slide, setSlide] = useState(0);
  const items = [...Object.values(reviews).flat().slice(-10).reverse(), ...reviewExamples].slice(0,10);
  const index = slide % items.length;
  const active = items[index];
  function step(offset) { setSlide(current => (current + offset + items.length) % items.length); }

  return <section className="block review-carousel" aria-label="Карусель отзывов">
    <div className="review-carousel-intro"><span className="eyebrow">ОБРАТНАЯ СВЯЗЬ</span><h2>Отзывы покупателей</h2><p>О товарах, самовывозе и услугах магазина.</p></div>
    <div className="panel review-stage">
      <div className="review-slide" key={index} aria-live="polite" aria-atomic="true">
        <span className="rating" aria-label={'Оценка ' + active.stars + ' из 5'}>{'★'.repeat(active.stars)}{'☆'.repeat(5-active.stars)}</span>
        {active.topic && <h3>{active.topic}</h3>}
        <blockquote>{active.body}</blockquote><small>{active.name}</small>
      </div>
      <div className="review-controls">
        <button className="outline" aria-label="Предыдущий отзыв" onClick={() => step(-1)}><ChevronLeft size={20}/></button>
        <div className="review-dots">{items.map((_, position) => <button type="button" key={position} aria-label={'Отзыв ' + (position + 1)} aria-current={position === index ? 'true' : undefined} onClick={() => setSlide(position)}/>)}</div>
        <button className="outline" aria-label="Следующий отзыв" onClick={() => step(1)}><ChevronRight size={20}/></button>
      </div>
      <small className="review-count">{index + 1} / {items.length}</small>
    </div>
  </section>;
}

export function ExtraHome({reviews, subscribe}) {
  return <>
    <ReviewCarousel reviews={reviews}/>
    <section className="block callout"><h2>Покупки для ремонта в одном месте</h2><p>От подбора инструмента до комплектации по списку. Посмотрите, чем можем помочь на каждом этапе.</p><div className="row"><a className="primary" href="#services">Услуги магазина</a><a className="outline" href="#about">О СтройБазе</a></div></section>
    <section className="block"><div className="heading"><h2>Услуги магазина</h2><a className="text-button" href="#services">Все услуги</a></div><div className="info-grid">{services.map(item => <a className="panel info-tile" href={'#services/' + item.id} key={item.id}><span>{item.price ? 'От ' + money(item.price) : 'Бесплатно'}</span><h3>{item.title}</h3></a>)}</div></section>
    <Faq/>
    <section className="block callout"><h2>Спецпредложения магазина</h2><p>Оставьте почту, чтобы сохранить подписку на акции и скидки.</p><form className="row subscribe-form" onSubmit={subscribe}><label>Электронная почта<input type="email" name="email" required placeholder="name@example.com"/></label><button className="primary">Подписаться</button></form></section>
  </>;
}

export function RequestDialog({dialog, request, submit, max, error}) {
  return <dialog ref={dialog} className="search-dialog request-dialog" aria-labelledby="request-title">
    <div className="heading"><h2 id="request-title">{request?.kind === 'product' ? 'Быстрое бронирование' : 'Заявка на услугу'}</h2><button className="icon-button" onClick={() => dialog.current.close()} aria-label="Закрыть заявку"><X/></button></div>
    {request && <form key={request.id + request.kind} className="form" onSubmit={submit}><p>{request.name}</p><label>Имя<input name="name" autoComplete="name" required minLength="2"/></label>
      {request.kind === 'product' ? <><label>Количество<input name="quantity" type="number" min="1" max={max} defaultValue="1" required/></label><label>Дата самовывоза<input name="date" type="date" min={dayKey()} required/></label><label>Интервал<select name="slot" required><option value="">Выберите время</option>{slots.map(slot => <option key={slot}>{slot}</option>)}</select></label></> : <label>Что нужно сделать<textarea name="comment" required maxLength="1000"/></label>}
      {error && <p role="alert">{error}</p>}<button className="primary">Сохранить заявку</button>
    </form>}
  </dialog>;
}

async function passwordKey(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:encoder.encode(salt), iterations:210000}, key, 256);
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2,'0')).join('');
}

export function LocalAccount({users,setUsers,session,setSession,notify}) {
  const [mode,setMode] = useState('login');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => {mounted.current = false;}; }, []);
  const user = users.find(item => item.email === session);

  async function authenticate(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim().toLowerCase();
    const name = String(form.get('name') || '').trim();
    const found = users.find(item => item.email === email);
    if (mode === 'register' && (found || name.length < 2)) return setError(found ? 'Эта почта уже используется.' : 'Введите имя из двух или более символов.');
    if (mode === 'login' && !found) return setError('Проверьте почту и пароль.');
    try {
      setBusy(true); setError('');
      const salt = found?.salt || crypto.randomUUID();
      const hash = await passwordKey(String(form.get('password')),salt);
      if (!mounted.current) return;
      if (mode === 'login' && found.hash !== hash) return setError('Проверьте почту и пароль.');
      if (mode === 'register') setUsers(list => [...list,{email,name,salt,hash}]);
      setSession(email);
      notify(mode === 'register' ? 'Профиль создан' : 'Вы вошли в профиль');
    } catch { if (mounted.current) setError('Вход доступен через HTTPS или localhost.'); }
    finally { if (mounted.current) setBusy(false); }
  }

  return <section className="block panel profile-panel"><h2>Ваш профиль</h2>
    {user ? <form className="form" onSubmit={event => {
      event.preventDefault();
      const name = String(new FormData(event.currentTarget).get('name')).trim();
      if (name.length < 2) return setError('Введите имя из двух или более символов.');
      setUsers(list => list.map(item => item.email === session ? {...item,name} : item)); setError(''); notify('Профиль обновлён');
    }}><p>{user.email}</p><label>Имя<input name="name" defaultValue={user.name} minLength="2" required/></label>{error && <p role="alert">{error}</p>}<div className="row"><button className="primary">Сохранить профиль</button><button type="button" className="outline" onClick={() => {setSession(''); setMode('login'); setError('');}}>Выйти</button></div></form> :
      <><div className="row"><button className="outline" aria-pressed={mode==='login'} disabled={busy} onClick={() => {setMode('login');setError('');}}>Вход</button><button className="outline" aria-pressed={mode==='register'} disabled={busy} onClick={() => {setMode('register');setError('');}}>Регистрация</button></div>
        <form className="form" key={mode} onSubmit={authenticate}>{mode==='register' && <label>Имя<input name="name" autoComplete="name" minLength="2" required/></label>}<label>Почта<input name="email" type="email" autoComplete="username" required/></label><label>Пароль<input name="password" type="password" minLength="8" autoComplete={mode==='login' ? 'current-password' : 'new-password'} required/></label>{error && <p role="alert">{error}</p>}<button className="primary" disabled={busy}>{mode==='login' ? 'Войти' : 'Создать профиль'}</button></form></>}
    <p className="muted">Профиль хранится в этом браузере. Используйте отдельный пароль для СтройБазы.</p>
  </section>;
}

