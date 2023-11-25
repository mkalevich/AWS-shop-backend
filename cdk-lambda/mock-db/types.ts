export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
  }

  export interface Stock {
    count: number;
    product_id: string;
  }