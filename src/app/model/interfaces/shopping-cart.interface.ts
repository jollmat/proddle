export interface ShoppingCartInterface {
  createDate?: number;
  updateDate?: number;
  productsBarcodesUnits: { barcode: string; units: number, checked: boolean }[];
}
