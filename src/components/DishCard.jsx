import React from "react";

export default function DishCard({ item, onAdd }) {
  return (
    <div className="dish">
      <div className="dish-heart">
        <i className="fa-solid fa-heart"></i>
      </div>
      <img src={item.img} className="dish-image" alt={item.name} />
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
