import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function toastError(error: any, msg?: string) {
	try {
		toast.error(String(error));
	} catch (_e) {}
	console.error(msg, error);
}
