import { z } from "zod";

export const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  type: z.enum(["in", "out"]),
});

export const updateThresholdSchema = z.object({
  productId: z.string().uuid(),
  threshold: z.number().min(0),
});
