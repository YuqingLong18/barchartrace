import { NextResponse } from 'next/server';
import { generateRaceSpec } from '@/lib/llm/client';
import { EXAMPLE_RACESPEC } from '@/lib/data/fixture';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt } = body;

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.warn("OPENROUTER_API_KEY not found. Using mock data.");
            // Fallback for demo/dev if no key is present
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                status: 'ok',
                raceSpec: EXAMPLE_RACESPEC,
                warning: "Running in mock mode (missing API key)"
            });
        }

        const raceSpec = await generateRaceSpec(prompt, apiKey);

        return NextResponse.json({
            status: 'ok',
            raceSpec
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { status: 'error', message: error.message || 'Failed to generate race.' },
            { status: 500 }
        );
    }
}
