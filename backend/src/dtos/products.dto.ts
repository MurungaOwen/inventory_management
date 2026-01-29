import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  supplier: z.string().optional(),
  unit: z.enum(["pcs", "bag", "liter", "kg", "box", "roll", "meter"]),
  costPrice: z.number().min(0, "Cost price must be non-negative"),
  sellingPrice: z.number().min(0, "Selling price must be non-negative"),
  description: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();
