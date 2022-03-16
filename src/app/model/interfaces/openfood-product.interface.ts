export interface OpenFoodProductInterface {
  code: string;
  product: {
    product_name: string;
    brands: string;
    image_thumb_url: string | null;
    image_url: string | null;
  };
}
