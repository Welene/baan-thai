import { API_BASE_URL } from '../config/api';

interface OrderData {
    userId: string;
    order: Array<{
        productId: number;
        quantity: number;
    }>;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: number;
    message?: string;
    paymentStatus?: 'pending' | 'paid' | 'failed';
}

interface OrderResponse {
    success: boolean;
    orderId?: string;
    order: {
        orderId?: string;
        id?: string;
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

export async function cancelOrder(orderId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}
