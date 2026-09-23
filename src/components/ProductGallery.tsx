"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, title, category, kind }: { images: string[]; title: string; category: string; kind: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="psingle-gallery-main woocommerce-product-gallery images-wrapper">
        <Image src={current} alt={`${title} — ${category} ${kind} at EduBazar.shop`} width={800} height={600} priority fetchPriority="high" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
      </div>
      {images.length > 1 && (
        <div className="thumb-row thumbnails-list" role="list">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? "active" : ""}
              aria-label={`View ${title} image ${i + 1}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <Image src={img} alt={`${title} thumbnail ${i + 1} — ${category}`} width={120} height={90} loading="lazy" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
