import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Gradesheet Analyzer | Boracle';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    padding: '80px',
                    position: 'relative',
                }}
            >
                {/* Decorative background circles */}
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
                
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '120px',
                        height: '120px',
                        background: '#3b82f6',
                        borderRadius: '30px',
                        marginBottom: '40px',
                        boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)',
                        zIndex: 10,
                    }}
                >
                    <span style={{ fontSize: '72px', color: 'white' }}>📈</span>
                </div>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'white',
                    padding: '8px 24px',
                    borderRadius: '9999px',
                    color: '#2563eb',
                    fontSize: '24px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '32px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    zIndex: 10,
                }}>
                    B.O.R.A.C.L.E
                </div>

                <h1
                    style={{
                        fontSize: '84px',
                        fontWeight: 900,
                        color: '#1e3a8a',
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        letterSpacing: '-0.03em',
                        textAlign: 'center',
                        zIndex: 10,
                    }}
                >
                    Gradesheet Analyzer
                </h1>
                
                <p
                    style={{
                        fontSize: '36px',
                        color: '#475569',
                        marginTop: 0,
                        marginBottom: '0',
                        textAlign: 'center',
                        maxWidth: '900px',
                        lineHeight: 1.4,
                        fontWeight: 500,
                        zIndex: 10,
                    }}
                >
                    Analyze your CGPA and project your graduation targets. 100% client-side privacy.
                </p>
            </div>
        ),
        {
            ...size,
        }
    );
}
