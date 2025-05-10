import { NextRequest, NextResponse } from 'next/server';

// URL backend API
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
    try {
        // Lấy path từ URL
        const requestUrl = new URL(request.url);
        const path = requestUrl.pathname.replace('/api/proxy', '');
        const searchParams = requestUrl.search;

        // Tạo URL mới để chuyển tiếp yêu cầu đến backend
        const targetUrl = `${API_BASE_URL}${path}${searchParams}`;

        // Lấy headers từ yêu cầu gốc (ngoại trừ 'host')
        const headers = new Headers();
        request.headers.forEach((value, key) => {
            if (key !== 'host') {
                headers.append(key, value);
            }
        });

        // Gọi API backend
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers,
        });

        // Nếu response không OK, ném lỗi
        if (!response.ok) {
            throw new Error(`API trả về mã lỗi: ${response.status}`);
        }

        // Lấy dữ liệu từ response
        const data = await response.json();

        // Trả về dữ liệu cho client
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API proxy error:', error);

        // Trả về lỗi chi tiết
        return NextResponse.json(
            {
                error: true,
                message: error.message || 'Lỗi kết nối tới backend API',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Lấy path từ URL
        const requestUrl = new URL(request.url);
        const path = requestUrl.pathname.replace('/api/proxy', '');

        // Lấy body từ request
        const body = await request.json();

        // Tạo URL mới để chuyển tiếp yêu cầu đến backend
        const targetUrl = `${API_BASE_URL}${path}`;

        // Lấy headers từ yêu cầu gốc (ngoại trừ 'host')
        const headers = new Headers();
        request.headers.forEach((value, key) => {
            if (key !== 'host') {
                headers.append(key, value);
            }
        });
        headers.set('Content-Type', 'application/json');

        // Gọi API backend
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        // Nếu response không OK, ném lỗi
        if (!response.ok) {
            throw new Error(`API trả về mã lỗi: ${response.status}`);
        }

        // Lấy dữ liệu từ response
        const data = await response.json();

        // Trả về dữ liệu cho client
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API proxy error:', error);

        // Trả về lỗi chi tiết
        return NextResponse.json(
            {
                error: true,
                message: error.message || 'Lỗi kết nối tới backend API',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
} 