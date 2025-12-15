import { API_BASE_URL } from '../config/api';
import { fetchWithApiKey } from '../api/fetchWithApiKey';

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
    orderId?: string;
    order: {
        orderId?: string;
        id?: string;
        [key: string]: any;
    };
}


// ---------------------------------------- START OF FETCH 1 --------------------------------------------
export async function createOrder(orderData: OrderData): Promise<OrderResponse> {
    const response = await fetchWithApiKey(`${API_BASE_URL}/api/orders`, {
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
// ---------------------------------------- END OF FETCH 1 --------------------------------------------


// ---------------------------------------- START OF FETCH 2 --------------------------------------------
export async function cancelOrder(orderId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithApiKey(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
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

// ---------------------------------------- END OF FETCH 2 --------------------------------------------


// ---------------------------------------- START OF FETCH 3 --------------------------------------------
export async function editOrder(orderId: string, orderData: { order: Array<{ productId: number; quantity: number }> }): Promise<{ success: boolean; message: string; booking?: any }> {
    const response = await fetchWithApiKey(`${API_BASE_URL}/api/orders/${orderId}/edit`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}
// ---------------------------------------- END OF FETCH 3 --------------------------------------------

/* Author: Tim  
Definierar TypeScript-interfaces för orderdata och tre API-funktioner: skapa, avbryta och redigera beställningar*/

// Helene edit: changed fetch to fetchWithApiKey 