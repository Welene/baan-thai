interface OrderData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: number;
    order: Array<{
        productId: number;
        amount: number;
        price: number;
        name: string;
    }>;
    totalPrice: number;
    message: string;
    payment: Array<{ paymentType: string }>;
    paymentStatus: string;
}

interface OrderResponse {
    success: boolean;
    order: {
        id: string;
        [key: string]: any;
    };
}

export async function createOrder(orderData: OrderData): Promise<OrderResponse> {
    const response = await fetch('http://localhost:3000/api/orders', {
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
