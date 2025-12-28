import { DataPoint, RaceSpec } from '../llm/schema';

// Helper to check if a value is a number
const isNum = (v: any): v is number => typeof v === 'number' && !isNaN(v);

/**
 * Linearly interpolates between two numbers.
 */
function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Generates a full set of interpolated frames for the given RaceSpec.
 * Returns an array of arrays, where each inner array is the state of all data points for that frame.
 */
export function generateInterpolatedFrames(spec: RaceSpec): DataPoint[][] {
    const { data, framesPerStep, timeField, entityField, valueField } = spec;

    // 1. Group data by year
    const rawYears = Array.from(new Set(data.map(d => Number(d[timeField as keyof DataPoint])))).sort((a, b) => a - b);

    if (rawYears.length < 2) return [data]; // Cannot interpolate with < 2 steps

    const frames: DataPoint[][] = [];
    const entityNames = Array.from(new Set(data.map(d => String(d[entityField as keyof DataPoint]))));

    // 2. Iterate through year transitions
    for (let i = 0; i < rawYears.length - 1; i++) {
        const startYear = rawYears[i];
        const endYear = rawYears[i + 1];

        // Get data for start and end years
        const startData = data.filter(d => Number(d[timeField as keyof DataPoint]) === startYear);
        const endData = data.filter(d => Number(d[timeField as keyof DataPoint]) === endYear);

        // Create a map for quick lookup
        const startMap = new Map(startData.map(d => [String(d[entityField as keyof DataPoint]), Number(d[valueField as keyof DataPoint])]));
        const endMap = new Map(endData.map(d => [String(d[entityField as keyof DataPoint]), Number(d[valueField as keyof DataPoint])]));

        // Generate K frames between startYear and endYear (exclusive of endYear, unless it's the last segment)
        // Actually, usually we do [0..framesPerStep-1] for each interval.
        // The very last frame of the last interval should equal or lead into the final state.

        // We want framesPerStep frames total for this interval.
        for (let f = 0; f < framesPerStep; f++) {
            const t = f / framesPerStep;
            const currentYearValue = lerp(startYear, endYear, t);

            const frameData: DataPoint[] = [];

            entityNames.forEach(name => {
                const startVal = startMap.get(name);
                const endVal = endMap.get(name);

                // Policy:
                // 1. If present in both, interpolate.
                // 2. If present in start but not end, fade out? Or hold? Or linear extrapolation? 
                //    Let's assume linear interpolation to 0 if missing, or just hold if that's safer.
                //    Standard pattern: assume missing = 0 if it was present before.
                // 3. If present in end but not start, interpolate from 0.

                const s = isNum(startVal) ? startVal : (isNum(endVal) ? 0 : 0);
                const e = isNum(endVal) ? endVal : (isNum(startVal) ? 0 : 0);

                // Optimization: if both are 0/missing, skip? 
                // No, we might want to show them disappearing. 
                // But for performance, maybe skip if 0.
                if (s === 0 && e === 0) return;

                const distinctValue = lerp(s, e, t);

                frameData.push({
                    year: Number(currentYearValue.toFixed(2)), // Keep year float for display if needed
                    name: name,
                    value: distinctValue,
                });
            });

            frames.push(frameData);
        }
    }

    // Add the final state (the very last year)
    // The loop goes up to rawYears.length - 1
    // We need to add the final exact frame.
    const finalYear = rawYears[rawYears.length - 1];
    const finalData = data.filter(d => Number(d[timeField as keyof DataPoint]) === finalYear);
    // Normalize final data structure
    frames.push(finalData.map(d => ({
        year: finalYear,
        name: String(d[entityField as keyof DataPoint]),
        value: Number(d[valueField as keyof DataPoint])
    })));

    return frames;
}
