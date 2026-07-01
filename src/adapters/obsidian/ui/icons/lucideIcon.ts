import { getIcon } from "obsidian";

// Simple icon helper with safe null handling
export const lucideIcon = (value: string) => getIcon(value)?.outerHTML ?? "";
