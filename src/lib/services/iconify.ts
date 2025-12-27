/**
 * Iconify API Service
 * Free icon service with 200k+ icons from multiple sets
 * Docs: https://iconify.design/docs/api/
 */

const ICONIFY_API = 'https://api.iconify.design';

export interface IconifyIcon {
	icons: Record<string, { body: string }>;
	width?: number;
	height?: number;
	left?: number;
	top?: number;
	rotate?: number;
	hFlip?: boolean;
	vFlip?: boolean;
}

export interface IconifySearchResult {
	icons: string[];
	total: number;
	limit: number;
	start: number;
	collections: Record<string, { name: string; total: number }>;
}

/**
 * Fetch icon data from Iconify API
 * @param iconSet - Icon set prefix (e.g., 'lucide', 'mdi', 'heroicons')
 * @param iconName - Icon name without prefix
 * @returns Icon data with SVG body
 */
export async function fetchIcon(
	iconSet: string,
	iconName: string,
): Promise<IconifyIcon | null> {
	try {
		const response = await fetch(
			`${ICONIFY_API}/${iconSet}.json?icons=${iconName}`,
		);
		if (!response.ok) return null;
		const responseJSON = await response.json();
		return responseJSON;
	} catch (error) {
		console.error('Failed to fetch icon:', error);
		return null;
	}
}

/**
 * Get full SVG string for an icon
 * @param iconSet - Icon set prefix
 * @param iconName - Icon name
 * @param className - Optional CSS classes
 * @returns Complete SVG string ready for rendering
 */
export async function getIconSVG(
	iconSet: string,
	iconName: string,
	className?: string,
): Promise<string | null> {
	const icon = await fetchIcon(iconSet, iconName);
	if (!icon || icon.icons == undefined) return null;
	const extractedIconName = Object.keys(icon.icons)[0];
	if (!extractedIconName) return null;

	const width = icon.width || 24;
	const height = icon.height || 24;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"${className ? ` class="${className}"` : ''}>${icon.icons[extractedIconName].body}</svg>`;
}

/**
 * Search icons across all collections or specific set
 * @param query - Search query
 * @param options - Search options
 * @returns Search results with icon names
 */
export async function searchIcons(
	query: string,
	options?: {
		prefix?: string; // Filter by icon set (e.g., 'lucide')
		limit?: number; // Results per page (default 64, max 999)
		start?: number; // Pagination offset
	},
): Promise<IconifySearchResult | null> {
	try {
		const params = new URLSearchParams({
			query,
			limit: (options?.limit || 64).toString(),
			start: (options?.start || 0).toString(),
			...(options?.prefix && { prefix: options.prefix }),
		});

		const response = await fetch(`${ICONIFY_API}/search?${params}`);
		if (!response.ok) return null;
		const responseJSON = await response.json();
		responseJSON.icons = responseJSON.icons.map((iconFullName: string) =>
			iconFullName.replace(`${options?.prefix || ''}:`, ''),
		);
		console.log('Icon search response:', responseJSON);
		return responseJSON;
	} catch (error) {
		console.error('Failed to search icons:', error);
		return null;
	}
}
