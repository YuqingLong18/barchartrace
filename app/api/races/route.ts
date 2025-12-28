import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { RaceSpecSchema } from '@/lib/llm/schema';
import { isAuthenticated } from '@/lib/auth/server';

const DATA_DIR = path.join(process.cwd(), 'data', 'saved-races');

// Helper to ensure dir exists
async function ensureDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    await ensureDir();
    try {
        const files = await fs.readdir(DATA_DIR);
        const races = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(DATA_DIR, file);
                const content = await fs.readFile(filePath, 'utf-8');
                try {
                    const json = JSON.parse(content);
                    // Light validation: check if it has title and created date
                    // We can add an 'id' field if not present, based on filename
                    races.push({
                        id: file.replace('.json', ''),
                        title: json.title,
                        subtitle: json.subtitle,
                        createdAt: json.createdAt || new Date().toISOString(), // Fallback
                        ...json
                    });
                } catch (e) {
                    console.warn(`Failed to parse ${file}`, e);
                }
            }
        }

        // Sort by createdAt desc
        races.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ status: 'ok', races });
    } catch (error) {
        return NextResponse.json({ status: 'error', message: 'Failed to list races' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    await ensureDir();
    try {
        const body = await request.json();
        // Validate
        const spec = RaceSpecSchema.parse(body);

        // Generate ID
        const id = `race-${Date.now()}`;
        const filePath = path.join(DATA_DIR, `${id}.json`);

        const dataToSave = {
            id,
            createdAt: new Date().toISOString(),
            ...spec
        };

        await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));

        return NextResponse.json({ status: 'ok', id, message: 'Race saved' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 'error', message: 'Failed to save race' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    await ensureDir();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ status: 'error', message: 'Missing id' }, { status: 400 });
        }

        // Simple sanitization
        const safeId = id.replace(/[^a-zA-Z0-9-]/g, '');
        const filePath = path.join(DATA_DIR, `${safeId}.json`);

        await fs.unlink(filePath);

        return NextResponse.json({ status: 'ok', message: 'Race deleted' });
    } catch (error) {
        return NextResponse.json({ status: 'error', message: 'Failed to delete race' }, { status: 500 });
    }
}
