"use client";

import { useState } from "react";
import { inputClass } from "@/components/new-admin/ui";

export default function StorefrontTargetFields({ categories, products, item }) {
  const [targetType, setTargetType] = useState(item?.targetType || "COLLECTION");

  return (
    <>
      <select
        name="targetType"
        value={targetType}
        onChange={(event) => setTargetType(event.target.value)}
        className={inputClass}
        aria-label="Destination type"
      >
        <option value="COLLECTION">Collection home</option>
        <option value="CATEGORY">Category</option>
        <option value="PRODUCT">Product</option>
        <option value="CUSTOM">Custom local path</option>
      </select>
      <select
        name="categoryId"
        defaultValue={item?.categoryId || ""}
        className={inputClass}
        required={targetType === "CATEGORY"}
        aria-label="Destination category"
      >
        <option value="">Choose category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      <select
        name="productId"
        defaultValue={item?.productId || ""}
        className={inputClass}
        required={targetType === "PRODUCT"}
        aria-label="Destination product"
      >
        <option value="">Choose product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>{product.name}</option>
        ))}
      </select>
      <input
        name="customHref"
        defaultValue={item?.customHref || ""}
        className={inputClass}
        placeholder="/shoes/products"
        required={targetType === "CUSTOM"}
        pattern="/(?!/).*"
        title="Enter a local path beginning with one slash, for example /shoes/products."
        aria-label="Custom destination path"
      />
    </>
  );
}
