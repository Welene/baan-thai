import { API_BASE_URL } from '../config/api';

interface OrderData {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: number;
    message?: string;
    totalPrice?: number;
    payment?: Array<{ paymentType: string }>;
    paymentStatus?: string;
    order: Array<{
        productId: number;
        quantity: number;
    }>;
}

interface OrderResponse {
    success: boolean;
    order: {
        id: string;
        [key: string]: any;
    };
}

export async function createOrder(orderData: OrderData): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}
