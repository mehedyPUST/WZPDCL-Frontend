import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return `৳${amount.toFixed(2)}`;
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}