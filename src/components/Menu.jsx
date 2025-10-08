import React, { useRef, useEffect, useState } from "react";
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
          <CarouselGroup
            key={group.category}
            id={id}
            title={group.category}
            items={group.items}
            onAdd={onAdd}
          />
        );
      })}
    </section>
  );
}

function CarouselGroup({ id, title, items, onAdd }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const cardGap = 24; // must match CSS gap

  // create repeated items so we can simulate infinite scroll by placing user in the middle copy
  const repeats = 3; // number of repetitions
  const extended = [];
  for (let i = 0; i < repeats; i++) {
    extended.push(
      ...items.map((it, idx) => ({ ...it, __idx: idx, __copy: i }))
    );
  }

  // measure and set initial scroll to the middle copy
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const setToMiddle = (useSmooth = false) => {
      const child = track.children[0];
      if (!child) return;
      const cardWidth = child.getBoundingClientRect().width + cardGap;
      const middleIndex = items.length * Math.floor(repeats / 2);
      const prev = track.style.scrollBehavior;
      track.style.scrollBehavior = useSmooth ? "smooth" : "auto";
      track.scrollLeft = middleIndex * cardWidth;
      track.style.scrollBehavior = prev || "smooth";
    };

    // set after images load to ensure dimensions are stable
    const imgs = track.querySelectorAll("img");
    let loaded = 0;
    if (imgs.length === 0) {
      requestAnimationFrame(() => setToMiddle(false));
    } else {
      imgs.forEach((img) => {
        if (img.complete) loaded++;
        else img.addEventListener("load", () => {
          loaded++;
          if (loaded === imgs.length) setToMiddle(false);
        });
      });
      if (loaded === imgs.length) requestAnimationFrame(() => setToMiddle(false));
      // fallback: ensure middle is set after a short timeout
      const t = setTimeout(() => setToMiddle(false), 500);
      // cleanup
      return () => clearTimeout(t);
    }
    window.addEventListener("resize", () => setToMiddle(false));
    return () => window.removeEventListener("resize", () => setToMiddle(false));
  }, [items.length]);

  // handle scroll, active index and infinite wrap
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onScroll() {
      const child = track.children[0];
      if (!child) return;
      const cardWidth = child.getBoundingClientRect().width + cardGap;
      const rawIdx = Math.round(track.scrollLeft / cardWidth);
      const logicalIdx =
        ((rawIdx % items.length) + items.length) % items.length;
      setActive(logicalIdx);

      // infinite wrap: if near start or end, teleport to middle copy equivalent
      const minBound = items.length * cardWidth * 0.5;
      const maxBound = items.length * cardWidth * (repeats - 0.5);
      if (track.scrollLeft < minBound || track.scrollLeft > maxBound) {
        const offsetInItems = rawIdx % items.length;
        const middleIndex =
          items.length * Math.floor(repeats / 2) + offsetInItems;
        // jump without smooth
        const prev = track.style.scrollBehavior;
        track.style.scrollBehavior = "auto";
        track.scrollLeft = middleIndex * cardWidth;
        track.style.scrollBehavior = prev || "smooth";
      }
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => track.removeEventListener("scroll", onScroll);
  }, [items.length]);

  // pointer drag support
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    function pointerDown(e) {
      isDown = true;
      track.classList.add("is-dragging");
      startX = e.pageX || e.touches?.[0]?.pageX;
      scrollStart = track.scrollLeft;
      // prevent native image drag
      track.style.scrollBehavior = "auto";
    }
    function pointerMove(e) {
      if (!isDown) return;
      const x = e.pageX || e.touches?.[0]?.pageX;
      const dx = startX - x;
      track.scrollLeft = scrollStart + dx;
    }
    function pointerUp() {
      isDown = false;
      track.classList.remove("is-dragging");
      // restore smooth behavior
      track.style.scrollBehavior = "smooth";
    }

    track.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);

    // touch fallback
    track.addEventListener("touchstart", pointerDown, { passive: true });
    track.addEventListener("touchmove", pointerMove, { passive: false });
    track.addEventListener("touchend", pointerUp);

    return () => {
      track.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      track.removeEventListener("touchstart", pointerDown);
      track.removeEventListener("touchmove", pointerMove);
      track.removeEventListener("touchend", pointerUp);
    };
  }, []);

  function scrollBy(direction = 1) {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[0];
    if (!child) return;
    const cardWidth = child.getBoundingClientRect().width + cardGap;
    track.scrollBy({ left: cardWidth * direction, behavior: "smooth" });
  }

  return (
    <div className="menu-group" id={id}>
      <h3 className="section-subtitle">{title}</h3>

      <div className="carousel modern">
        <button
          className="carousel-btn carousel-btn-left"
          aria-label={`Anterior ${title}`}
          onClick={() => scrollBy(-1)}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <div className="carousel-track" ref={trackRef} tabIndex={0}>
          {extended.map((item, idx) => (
            <div
              className="carousel-cell"
              key={`${item.name}-${item.__copy}-${idx}`}
            >
              <DishCard item={item} onAdd={onAdd} />
            </div>
          ))}
        </div>

        <button
          className="carousel-btn carousel-btn-right"
          aria-label={`Próximo ${title}`}
          onClick={() => scrollBy(1)}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
