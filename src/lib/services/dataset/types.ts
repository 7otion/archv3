import type { ContentType } from '@/lib/models/content-type';

export interface Dataset {
	id: string;
	title: string;
	description: string;
	author: string;
	updated_at: string;
	version: string;
	categories_count: number;
	tags_count: number;
	metadata_attributes_count: number;
	demo_data_count: number;
	size: string;
	json: DatasetJson;
}

export interface DatasetJson {
	content_type: ContentTypeData;
	categories: CategoryData[];
	tags: TagData[];
	content_metadata_attributes: MetadataAttributeData[];
	demo_data: DemoContentData[];
}

export interface ContentTypeData {
	id: string;
	name: string;
	slug: string;
	file_type: string;
	description: string;
	cover: string;
	icon: string;
	order?: number;
	pinned?: number;
	docked?: number;
	locked?: number;
}

export interface CategoryData {
	name: string;
	slug: string;
	description?: string | null;
}

export interface TagData {
	name: string;
	slug: string;
	description?: string | null;
}

export interface MetadataAttributeData {
	name: string;
	slug: string;
	attribute_type: string;
	icon: string | null;
	order: number | null;
	is_array: boolean;
	filterable: boolean;
	sortable: boolean;
	description?: string | null;
}

export interface DemoContentData {
	content_type_id: string;
	category_id: string;
	file_id: string | null;
	name: string;
	slug: string;
	description?: string | null;
	cover: string | null;
	cover_gif: string | null;
	rating: number | null;
	favorite: number | null;
	view_count: number | null;
	last_viewed_at: string | null;
	source_url: string | null;
	scrape_url: string | null;
	tags: string[] | null;
	metadata: Record<string, any> | null;
}

export interface ImportOptions {
	includeDemoData: boolean;
}

export interface ImportResult {
	success: boolean;
	contentType?: ContentType;
	error?: string;
	categoriesCount: number;
	tagsCount: number;
	attributesCount: number;
	demoDataCount: number;
}

export interface BatchImportResult {
	successful: number;
	failed: number;
	errors: string[];
}

// ============================================================================
// Error Classes
// ============================================================================

export class DatasetImportError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DatasetImportError';
	}
}

export class DuplicateContentTypeError extends DatasetImportError {
	constructor(name: string) {
		super(
			`Content type "${name}" already exists. Please delete it first or choose a different dataset.`,
		);
		this.name = 'DuplicateContentTypeError';
	}
}

export class CategoryNotFoundError extends DatasetImportError {
	constructor(slug: string, contentName: string) {
		super(
			`Category with slug "${slug}" not found. Cannot import demo content "${contentName}".`,
		);
		this.name = 'CategoryNotFoundError';
	}
}
