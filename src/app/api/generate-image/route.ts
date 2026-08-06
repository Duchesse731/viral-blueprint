import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

type AIProvider = 'openai' | 'openrouter' | 'replicate' | 'mock';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  return new OpenAI({ apiKey });
}

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }
  return apiKey;
}

async function generateWithOpenAI(prompt: string, model: string = 'dall-e-3') {
  const openai = getOpenAIClient();
  
  const size = model === 'dall-e-3' ? '1024x1024' : '1024x1024';
  
  const image = await openai.images.generate({
    model,
    prompt,
    n: 1,
    size,
    quality: model === 'dall-e-3' ? 'standard' : undefined,
    response_format: 'url',
  });

  if (!image.data || image.data.length === 0 || !image.data[0].url) {
    throw new Error('Failed to generate image');
  }

  return {
    imageUrl: image.data[0].url,
    revisedPrompt: image.data[0].revised_prompt,
  };
}

async function generateWithOpenRouter(prompt: string, model?: string) {
  const apiKey = getOpenRouterClient();
  
  // UseFlux AI via OpenRouter (supports image generation)
  const selectedModel = model || 'black-forest-labs/flux-1-schnell';
  
  const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      prompt,
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || error.detail || 'OpenRouter API error');
  }

  const data = await response.json();
  
  if (!data.data || data.data.length === 0 || !data.data[0].url) {
    throw new Error('Failed to generate image');
  }

  return {
    imageUrl: data.data[0].url,
    revisedPrompt: prompt,
  };
}

async function generateWithReplicate(prompt: string, model?: string) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error('Replicate API token is not configured');
  }

  const modelVersion = model || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89ad5decf85d1c5f76cad881c637e484a484a484a484a484a';
  
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: modelVersion,
      input: {
        prompt,
        guidance_scale: 7.5,
        num_inference_steps: 50,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Replicate API error');
  }

  const prediction = await response.json();
  
  // Poll for completion
  let result = prediction;
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: {
        'Authorization': `Token ${apiToken}`,
      },
    });
    
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Image generation failed');
  }

  const imageUrl = result.output?.[result.output.length - 1];
  if (!imageUrl) {
    throw new Error('No image output received');
  }

  return {
    imageUrl,
    revisedPrompt: prompt,
  };
}

function generateMock(prompt: string) {
  // Return a placeholder image for demo purposes
  return {
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt.substring(0, 50))}/1024/1024`,
    revisedPrompt: prompt,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, provider = 'openai', model } = body as {
      prompt: string;
      provider?: AIProvider;
      model?: string;
    };

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate prompt length for DALL-E 3
    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Please keep it under 4000 characters.' },
        { status: 400 }
      );
    }

    let result;

    switch (provider) {
      case 'openrouter':
        result = await generateWithOpenRouter(prompt, model);
        break;
      case 'replicate':
        result = await generateWithReplicate(prompt, model);
        break;
      case 'mock':
        result = generateMock(prompt);
        break;
      case 'openai':
      default:
        result = await generateWithOpenAI(prompt, model || 'dall-e-3');
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('token')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
}
