import { NextRequest, NextResponse, userAgent } from 'next/server';

export function middleware(request: NextRequest) {
    const { device } = userAgent(request);
    const isMobileDevice = device.type === 'mobile' || device.type === 'tablet';

    if (isMobileDevice) {
        return NextResponse.redirect(new URL('/blog', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/',
};
