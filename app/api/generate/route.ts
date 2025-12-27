import { NextResponse } from 'next/server';
import { EXAMPLE_RACESPEC } from '@/lib/data/fixture';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt } = body;

        console.log('Mock API received prompt:', prompt);

        // Simulate LLM processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // For now, return the fixture data regardless of prompt
        // In future steps, this will call the LLM service
        return NextResponse.json({
            status: 'ok',
            raceSpec: EXAMPLE_RACESPEC
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to generate race.' },
            { status: 500 }
        );
    }
}
