export interface OpenFoodProductInterface {
  code: string;
  product: {
    product_name: string;
    brands: string;
    image_thumb_url: string | null;
    image_url: string | null;
    categories: string;
    nutriscore_data: {
      grade: string;
    },
    nova_group: number;
    ecoscore_grade: string;
  };
}
