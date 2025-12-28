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

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
	try {
		const stored = localStorage.getItem(key);
		return stored ? JSON.parse(stored) : defaultValue;
	} catch (error) {
		console.error(`Error loading ${key} from localStorage:`, error);
		return defaultValue;
	}
};

export const saveToStorage = <T>(key: string, value: T): void => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Error saving ${key} to localStorage:`, error);
	}
};
