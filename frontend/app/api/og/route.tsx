import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Get search params
        const title = searchParams.get('title') || 'Engineering Jobs';
        const company = searchParams.get('company') || 'JobGrid';
        const location = searchParams.get('location') || 'Remote';
        const salary = searchParams.get('salary') || 'Competitive';
        const batch = searchParams.get('batch') || '';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        padding: '80px',
                        fontFamily: 'system-ui',
                    }}
                >
                    {/* Badge */}
                    <div
                        style={{
                            display: 'flex',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '40px',
                        }}
                    >
                        {batch ? `Batch ${batch} Eligible` : 'Now Hiring'}
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '72px',
                            fontWeight: 900,
                            color: 'white',
                            lineHeight: 1.1,
                            marginBottom: '20px',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {title}
                    </div>

                    {/* Company */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '48px',
                            fontWeight: 600,
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '60px',
                        }}
                    >
                        at {company}
                    </div>

                    {/* Footer Stats */}
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            gap: '40px',
                            marginTop: 'auto',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingTop: '40px',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Location</span>
                            <span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>{location}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Salary</span>
                            <span style={{ color: '#10b981', fontSize: '32px', fontWeight: 'bold' }}>{salary}</span>
                        </div>

                        {/* Branding */}
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                            <img
                                src="https://jobgrid.in/icon.png"
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    marginRight: '16px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <span style={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em' }}>JobGrid</span>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
