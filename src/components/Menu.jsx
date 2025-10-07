import React from "react";
import DishCard from "./DishCard";

export default function Menu({ groups, onAdd }) {
  const idMap = {
    Pizzas: "pizzas",
    Hambúgueres: "hambugueres",
    Bebidas: "bebidas",
  };

  return (
    <section id="menu" aria-label="Cardápio">
      {groups.map((group) => {
        const id = idMap[group.category] || undefined;
        return (
          <div key={group.category} id={id}>
            <h3 className="section-subtitle">{group.category}</h3>
            <div className="dishes">
              {group.items.map((item) => (
                <DishCard key={item.name} item={item} onAdd={onAdd} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
