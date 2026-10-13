// Structured autopsy schema with Zod validation

import { z } from "zod";

export const EvidenceItemSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const FindingSchema = z.object({
  title: z.string(),
  severity: z.enum(["info", "warn", "critical"]),
  explanation: z.string(),
  evidence: z.array(EvidenceItemSchema),
});

export const DataWindowSchema = z.object({
  from: z.string(), // UTC date string
  to: z.string(),   // UTC date string
  fillCount: z.number(),
  capped: z.boolean(),
});

export const StructuredAutopsySchema = z.object({
  walletType: z.string(),
  dataWindow: DataWindowSchema,
  headline: z.string(),
  summary: z.string(),
  findings: z.array(FindingSchema).max(3),
  behaviorNote: z.string().optional(),
  caveats: z.array(z.string()),
});

export type StructuredAutopsy = z.infer<typeof StructuredAutopsySchema>;
export type Finding = z.infer<typeof FindingSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type DataWindow = z.infer<typeof DataWindowSchema>;
