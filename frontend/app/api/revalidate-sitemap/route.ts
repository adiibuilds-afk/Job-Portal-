import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
    try {
        const { secret } = await req.json();

        // Security check
        if (secret !== process.env.REVALIDATION_SECRET) {
            return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
        }

        console.log('🔄 Revalidating sitemap...');
        
        // Revalidate the dynamic sitemap routes
        revalidatePath('/sitemap.xml');
        revalidatePath('/sitemap');
        revalidatePath('/jobs'); // Also revalidate jobs listing for freshness

        return NextResponse.json({ 
            revalidated: true, 
            now: Date.now(),
            message: 'Sitemap and Jobs revalidated successfully'
        });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

// Optional: Handle GET for quick testing (only in dev or with secret in query)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.REVALIDATION_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    revalidatePath('/sitemap.xml');
    return NextResponse.json({ revalidated: true });
}
