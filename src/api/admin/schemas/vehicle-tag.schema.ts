import { z } from "zod";

export const vehicleTagSchema = z.object({
  vehicleTagName: z
    .string({
      required_error: "Vehicle tag is required.",
      invalid_type_error: "Vehicle tag be a string.",
    })
    .min(1, "Vehicle tag is required."),
});
