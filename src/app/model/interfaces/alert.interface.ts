export interface AlertInterface {
    productBarcode: string;
    shopId: string;
    lastPrice: number;
    currentPrice: number;
    date: number;
}

export interface UserAlerts {
    updateDate: number,
    alerts: AlertInterface[]
}