import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";

export function useZodForm<T>(schema: ZodSchema<T>) {
  return useForm<T>({ resolver: zodResolver(schema) });
}
