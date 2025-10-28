// src/types/Product.ts
export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    variations: ProductVariation[];
    rating?: {
      average: number;
      count: number;
    };
    isNew?: boolean;
    onSale?: boolean;
    tags: string[];
    category?: {
      _id: string;
      name: string;
      slug: string;
    };
    // Add other fields that match your backend
  }
  
  export interface ProductVariation {
    size: string;
    color: string;
    colorCode: string;
    price: number;
    compareAtPrice?: number;
    inventory: {
      quantity: number;
    };
    images: Array<{
      url: string;
      alt: string;
    }>;
  }