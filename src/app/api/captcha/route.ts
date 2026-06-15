import { NextResponse } from 'next/server';
import { encryptCaptcha } from '@/lib/captcha';

function generateCaptchaSvg(code: string): string {
  const width = 120;
  const height = 40;
  
  // Draw background grid lines for noise
  let gridLines = '';
  for (let i = 10; i < width; i += 20) {
    gridLines += `<line x1="${i}" y1="0" x2="${i + (Math.random() * 10 - 5)}" y2="${height}" stroke="#e2e8f0" stroke-width="1" />`;
  }
  for (let j = 8; j < height; j += 10) {
    gridLines += `<line x1="0" y1="${j}" x2="${width}" y2="${j + (Math.random() * 6 - 3)}" stroke="#e2e8f0" stroke-width="1" />`;
  }

  // Draw random wavy curves for interference
  const pathsCount = 3;
  let interferences = '';
  for (let i = 0; i < pathsCount; i++) {
    const startX = Math.random() * 15;
    const startY = Math.random() * height;
    const controlX = width / 2 + (Math.random() * 20 - 10);
    const controlY = Math.random() * height;
    const endX = width - Math.random() * 15;
    const endY = Math.random() * height;
    const strokeWidth = 1.5 + Math.random() * 1.5;
    const strokeColor = i === 0 ? '#94a3b8' : '#cbd5e1';
    interferences += `<path d="M${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none"/>`;
  }

  // Position characters individually with rotation and vertical jitter
  let textElements = '';
  const charSpacing = width / (code.length + 1);
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = charSpacing * (i + 1) + (Math.random() * 6 - 3);
    const y = height / 2 + 5 + (Math.random() * 6 - 3);
    const angle = Math.floor(Math.random() * 30 - 15); // Rotate -15 to 15 degrees
    
    textElements += `<text x="${x}" y="${y}" transform="rotate(${angle}, ${x}, ${y})" dominant-baseline="middle" text-anchor="middle" font-family="Courier, monospace" font-size="24" font-weight="900" fill="#1e293b" style="user-select: none;">${char}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f1f5f9" rx="6" stroke="#cbd5e1" stroke-width="1.5"/>
    ${gridLines}
    ${interferences}
    ${textElements}
  </svg>`;
}

export async function GET() {
  try {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const timestamp = Date.now();
    const token = encryptCaptcha(code, timestamp);
    const svg = generateCaptchaSvg(code);
    
    const response = NextResponse.json({
      success: true,
      svg,
      token
    });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('[Captcha API] Error generating captcha:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate captcha.' },
      { status: 500 }
    );
  }
}
