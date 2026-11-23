import React, {useState} from 'react';
import { Boxes, Cable, Check, Drill, GitCompareArrows, Hammer, HardHat, MapPin, PaintRoller, Package, ShieldCheck, Truck } from 'lucide-react';
import { categories, money, products } from './data';

const icons = [Drill, Boxes, Hammer, HardHat, PaintRoller, Cable];

const productGuides = {
  Инструменты: ['Перед покупкой', 'Сверьте размер крепежа и рабочей оснастки. Для электроинструмента проверьте напряжение аккумулятора и наличие зарядного устройства.'],
  Стройматериалы: ['Подготовка к работе', 'Сверьте массу упаковки и условия хранения. Перед замешиванием сухих смесей проверьте расход и пропорции на упаковке.'],
  Крепёж: ['Подбор под основание', 'Подберите длину крепежа по толщине соединения и убедитесь, что он подходит для материала основания. Сделайте пробное крепление на обрезке.'],
  Спецодежда: ['Посадка и уход', 'Перчатки должны сидеть плотно и не сковывать движения. Проверьте целостность покрытия перед работой.'],
  Отделка: ['Сколько материала взять', 'Посчитайте площадь с учётом окон и дверей. Сверьте расход на упаковке, умножьте его на число слоёв и сделайте пробный выкрас.'],
  Электрика: ['Подключение инструмента', 'Проверьте допустимую нагрузку удлинителя и сравните её с мощностью инструмента. Требования к разматыванию кабеля указаны в инструкции изделия.'],
};

export function CatalogCategories({selected,choose}) {
  return <section className="catalog-shortcuts" aria-label="Разделы каталога">
    {categories.map((category,index) => {
      const Icon = icons[index];
      return <button type="button" className="outline" aria-pressed={selected === category} key={category}
        onClick={() => choose(selected === category ? '' : category)}><Icon size={20}/>{category}</button>;
    })}
  </section>;
}

export function ProductGuide({product, related, renderCard, reserve}) {
  const [title, text] = productGuides[product.category];
  return <>
    <section className="block product-workbench">
      <div className="panel"><span className="eyebrow">{product.category}</span><h2>{title}</h2><p>{text}</p></div>
      <div className="panel"><Package/><h2>Получение товара</h2><p>Для самовывоза можно отложить нужное количество на свободный интервал. Если в заказе несколько позиций, добавьте их в корзину и оформите вместе.</p><button className="outline" onClick={reserve} disabled={!reserve}>Выбрать самовывоз</button></div>
    </section>
    {related.length > 0 && <section className="block related-shelf"><h2>Другие товары категории «{product.category}»</h2><div className="product-grid">{related.map(renderCard)}</div></section>}
  </>;
}

export function FavoritesCollections({favorites,choose}) {
  const stored = products.filter(product => favorites.includes(product.id));
  return <section className="block saved-collections">
    <h2>{stored.length ? 'Ваши категории' : 'Подберите товары по задаче'}</h2>
    <div className="collection-grid">{categories.map((category,index) => {
      const Icon = icons[index];
      const count = stored.filter(product => product.category === category).length;
      return <button className="panel collection" key={category} onClick={() => choose(category)}>
        <Icon size={29}/><strong>{category}</strong><small>{count ? 'Сохранено: ' + count : 'Открыть каталог'}</small>
      </button>;
    })}</div>
  </section>;
}

export function ComparisonGuide({count,choose}) {
  return <section className="block comparison-workbench">
    <div className="panel compare-slots"><GitCompareArrows size={30}/><h2>Места для сравнения</h2>
      <ol>{[1,2,3].map(position => <li key={position} className={position <= count ? 'filled' : ''}>{position <= count ? <Check size={18}/> : <span>{position}</span>}{position <= count ? 'Товар добавлен' : 'Можно добавить товар'}</li>)}</ol>
      <button className="outline" onClick={() => choose('')}>Выбрать товары</button>
    </div>
    <div className="panel"><h2>Как читать характеристики</h2>
      <dl className="comparison-terms">
        <dt>Единица продажи</dt><dd>По штукам, в упаковке или по весу. Сравнивайте стоимость одинакового количества.</dd>
        <dt>Размер и совместимость</dt><dd>У сверла важен хвостовик, у отвёртки — тип шлица, у крепежа — длина и диаметр.</dd>
        <dt>Комплектация</dt><dd>Проверьте, идут ли в наборе аккумулятор, зарядное устройство и расходники.</dd>
      </dl>
    </div>
  </section>;
}

export function DeliveryGuide({checkout,subtotal,address}) {
  const threshold = 10000;
  const remaining = Math.max(0,threshold - subtotal);
  return checkout ?
    <section className="block checkout-help panel"><ShieldCheck/><h2>После подтверждения</h2>
      <ol className="delivery-steps">
        <li><strong>Заказ появится в кабинете</strong><span>В истории будут номер, состав заказа и выбранный интервал.</span></li>
        <li><strong>Подготовьтесь к получению</strong><span>При самовывозе покажите номер заказа. Для доставки проверьте адрес, подъезд и возможность разгрузки.</span></li>
        <li><strong>Проверьте комплектность</strong><span>Сверьте количество и упаковку товара при получении.</span></li>
      </ol><a className="text-button" href="#account">Открыть личный кабинет</a>
    </section> :
    <section className="block cart-delivery">
      <div className="panel"><Truck/><h2>Бесплатная доставка</h2><p>{remaining ? 'До бесплатной доставки осталось ' + money(remaining) : 'Сумма корзины подходит для бесплатной доставки'}</p>
        <progress value={Math.min(subtotal,threshold)} max={threshold} aria-label="Сумма для бесплатной доставки"/><div className="progress-labels"><span>{money(subtotal)}</span><span>{money(threshold)}</span></div>
      </div>
      <div className="panel"><MapPin/><h2>Можно забрать самостоятельно</h2><p>{address}</p><p>Самовывоз бесплатный. Выберите удобное окно получения.</p><a className="text-button" href="#schedule">Посмотреть график выдачи</a></div>
    </section>;
}

export function AccountTools({orders, requests, recent}) {
  const count = orders.length;
  const spent = orders.reduce((sum,order) => sum + order.total,0);
  return <section className="block account-overview"><h2>Сводка по покупкам</h2>
    <dl><div><dt>Заказы</dt><dd>{count}</dd></div><div><dt>Сумма заказов</dt><dd>{money(spent)}</dd></div><div><dt>Заявки на услуги</dt><dd>{requests.length}</dd></div><div><dt>Недавно смотрели</dt><dd>{recent.length}</dd></div></dl>
  </section>;
}

export function MaterialCalculator() {
  const [area, setArea] = useState('20');
  const [layers, setLayers] = useState('2');
  const [coverage, setCoverage] = useState('10');
  const valid = Number(area) > 0 && Number(layers) > 0 && Number(coverage) > 0;
  const litres = valid ? Math.ceil(Number(area) * Number(layers) / Number(coverage) * 11) / 10 : 0;
  return <section className="block material-calculator panel"><div><PaintRoller/><h2>Калькулятор краски</h2><p>Введите площадь без окон и дверей и расход с упаковки. В расчёт включён запас 10%.</p></div>
    <div className="calc-inputs"><label>Площадь, м²<input type="number" min="0.1" step="0.1" value={area} onChange={event => setArea(event.target.value)}/></label>
      <label>Слоёв<input type="number" min="1" max="10" value={layers} onChange={event => setLayers(event.target.value)}/></label>
      <label>Укрывистость, м²/л<input type="number" min="0.1" step="0.1" value={coverage} onChange={event => setCoverage(event.target.value)}/></label>
      <p className="calc-result" aria-live="polite">{valid ? <>Понадобится около <strong>{litres.toLocaleString('ru-RU')} л</strong></> : 'Заполните все три поля.'}</p>
    </div>
  </section>;
}

