import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách origins được phép
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://nova-web3.vercel.app', 'https://www.nova-web3.app']
    : ['http://localhost:3000', 'http://localhost:5000'];

export function middleware(request: NextRequest) {
    // Lấy origin từ request header
    const origin = request.headers.get('origin');
    const isApiRoute = request.nextUrl.pathname.startsWith('/api');

    // Tạo NextResponse từ request mà không cần thực hiện bất kỳ thay đổi nào
    const response = NextResponse.next();

    // Thêm header CORS cho API routes
    if (isApiRoute) {
        if (origin && allowedOrigins.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
        } else {
            // Cho phép browser đọc các header trả về
            response.headers.set('Access-Control-Allow-Origin', '*');
        }

        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Max-Age', '86400');
    }

    return response;
}

// Chỉ áp dụng middleware này cho các API route
export const config = {
    matcher: '/api/:path*',
}; 