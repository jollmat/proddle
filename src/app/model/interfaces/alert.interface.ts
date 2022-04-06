export interface AlertInterface {
    productBarcode: string;
    shopId: string;
    lastPrice: number;
    currentPrice: number;
    date: number;
    read: boolean;
}

export interface UserAlerts {
    updateDate: number,
    alerts: AlertInterface[]
}