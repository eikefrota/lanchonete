import React from "react";

export default function DishCard({ item, onAdd }) {
  const placeholder =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250"><rect width="100%" height="100%" fill="%23f3f3f3"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="14">Imagem indisponível</text></svg>';

  return (
    <div className="dish">
      <div className="dish-heart">
        <i className="fa-solid fa-heart"></i>
      </div>
      <img
        src={item.img}
        className="dish-image"
        alt={item.name}
        loading="lazy"
        onError={(e) => {
          if (e && e.currentTarget) e.currentTarget.src = placeholder;
        }}
      />
      <h3 className="dish-title">{item.name}</h3>
      <span className="dish-description">{item.desc}</span>
      <div className="dish-price">
        <h4>R$ {item.price.toFixed(2)}</h4>
        <button className="btn-dish" onClick={() => onAdd(item)}>
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  );
}
