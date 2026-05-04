'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // سيتم طباعة الخطأ في سيرفر Vercel أيضاً
        console.error(error);
    }, [error]);

    return (
        <div style={{ padding: '20px', direction: 'ltr' }}>
            <h2>حدث خطأ ما!</h2>
            {/* هذا السطر هو الأهم: سيطبع لك رسالة الخطأ البرمجي على شاشة الآيفون */}
            <div style={{ background: '#ffe6e6', padding: '10px', color: 'red', margin: '10px 0' }}>
                <strong>رسالة الخطأ:</strong> {error.message}
            </div>

            <button
                onClick={() => reset()}
                style={{ padding: '10px 20px', background: 'black', color: 'white' }}
            >
                حاول مرة أخرى
            </button>
        </div>
    );
}