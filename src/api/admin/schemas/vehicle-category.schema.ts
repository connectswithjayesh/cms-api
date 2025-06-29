import { z } from "zod";

export const vehicleCategorySchema = z.object({
  vehicleCatName: z
    .string({
      required_error: "Vehicle Category is required.",
      invalid_type_error: "Vehicle Category be a string.",
    })
    .min(1, "Vehicle Category is required."),
});
