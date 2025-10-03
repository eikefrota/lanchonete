import React from "react";
import DishCard from "./DishCard";

export default function Menu({ groups, onAdd }) {
  return (
    <section id="menu" aria-label="Cardápio">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="section-subtitle">{group.category}</h3>
          <div className="dishes">
            {group.items.map((item) => (
              <DishCard key={item.name} item={item} onAdd={onAdd} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
