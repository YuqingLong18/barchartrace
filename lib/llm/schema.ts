import { z } from 'zod';

export const SourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  accessed: z.string(), // YYYY-MM-DD
});

export const DataPointSchema = z.object({
  year: z.number().or(z.string()), // Flexible time field to allow string dates if needed
  name: z.string(),
  value: z.number(),
});

export const RaceSpecSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  unit: z.string(),
  valueFormat: z.enum(['shortCurrency', 'percent', 'number', 'shortScale']).default('shortScale'),
  timeField: z.string().default('year'),
  entityField: z.string().default('name'),
  valueField: z.string().default('value'),
  topN: z.number().default(12),
  framesPerStep: z.number().default(12),
  stepDurationMs: z.number().default(900),
  notes: z.string().optional(),
  sources: z.array(SourceSchema),
  data: z.array(DataPointSchema),
});

export type RaceSpec = z.infer<typeof RaceSpecSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type DataPoint = z.infer<typeof DataPointSchema>;
