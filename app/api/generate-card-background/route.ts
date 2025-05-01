import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.STABILITY_API_KEY;
  console.log('Stability API Key:', apiKey ? 'Key is set' : 'Key is missing'); // Debug log

  if (!apiKey) {
    return NextResponse.json({ error: 'Stability API key is not configured' }, { status: 500 });
  }

  try {
    const { prompt, style } = await request.json();

    if (!prompt || !style) {
      return NextResponse.json({ error: 'Prompt and style are required' }, { status: 400 });
    }

    // Fixed dimensions for the identity card (matches aspect ratio 1.58:1, close to 3:2)
    const width = 800;
    const height = 506;

    // Map the UI style to a valid style_preset for Stability AI API
    const stylePresetMap: { [key: string]: string } = {
      cyberpunk: 'neon-punk',
      quantum: 'fantasy-art',
      neural: 'digital-art',
      digital: 'digital-art',
      cosmic: 'fantasy-art',
      matrix: 'digital-art',
    };
    const stylePreset = stylePresetMap[style] || 'digital-art';

    // Enhance prompt with style and card-specific details
    const enhancedPrompt = `${prompt}, ${style} style, futuristic identity card background, high-tech, vibrant colors, sharp details, clean design, suitable for digital identity card`;

    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('mode', 'text-to-image'); // Explicitly set mode
    formData.append('output_format', 'png');
    formData.append('aspect_ratio', '3:2'); // Closest to 800x506 (1.58:1)
    formData.append('model', 'sd3.5-large'); // Use Stable Diffusion 3.5 Large
    formData.append('negative_prompt', 'blurry, low quality, distorted, text, logos, watermarks');
    formData.append('cfg_scale', '4'); // Default for SD 3.5 Large per documentation
    formData.append('style_preset', stylePreset);
    formData.append('seed', '0');
    formData.append('stability-client-id', 'identity-card-app');
    formData.append('stability-client-version', '1.0.0');

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'image/*',
    };
    console.log('Request Headers:', headers); // Debug log
    console.log('Request FormData:', Object.fromEntries(formData)); // Debug log

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stability API Error Response:', errorData); // Debug log
      return NextResponse.json(
        { error: `Stability API error: ${errorData.message || errorData.errors?.join(', ') || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Received non-image response from API' }, { status: 500 });
    }

    // Return the image as a response
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type,
        'Content-Length': blob.size.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating card background:', error);
    if (error.message.includes('401') || error.message.includes('403')) {
      return NextResponse.json(
        { error: 'Authentication error. Please verify API key and permissions.' },
        { status: 401 }
      );
    }
    if (error.message.includes('429')) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }
    if (error.message.includes('413')) {
      return NextResponse.json({ error: 'Request size exceeds 10MiB limit.' }, { status: 413 });
    }
    return NextResponse.json({ error: `Failed to generate card background: ${error.message}` }, { status: 500 });
  }
}