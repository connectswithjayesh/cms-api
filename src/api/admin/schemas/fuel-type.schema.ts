import { z } from "zod";

export const fuelTypeSchema = z.object({
  fuelTypeName: z
    .string({
      required_error: "Fuel type is required.",
      invalid_type_error: "Fuel type be a string.",
    })
    .min(1, "Vehicle tag is required."),
});
