import { ORM } from '@7otion/orm';
import { invoke } from '@tauri-apps/api/core';

import { ContentType } from '@/lib/models/content-type';
import { Category } from '@/lib/models/category';
import { Tag } from '@/lib/models/tag';
import { MetadataAttribute } from '@/lib/models/metadata-attribute';
import { Content } from '@/lib/models/content';
import { MetadataValue } from '@/lib/models/metadata-value';

import {
	CategoryNotFoundError,
	DuplicateContentTypeError,
	type BatchImportResult,
	type CategoryData,
	type Dataset,
	type DemoContentData,
	type ImportOptions,
	type ImportResult,
	type MetadataAttributeData,
	type TagData,
} from './types';
import { getRepository } from '@7otion/orm';

export type { Dataset } from './types';

export class DatasetImporter {
	contentTypeRepo = getRepository(ContentType);
	contentRepo = getRepository(Content);
	categoryRepo = getRepository(Category);
	tagRepo = getRepository(Tag);
	metaAttrRepo = getRepository(MetadataAttribute);
	metaAttrValueRepo = getRepository(MetadataValue);

	async importDataset(
		dataset: Dataset,
		options: ImportOptions,
	): Promise<ImportResult> {
		const result: ImportResult = {
			success: false,
			categoriesCount: 0,
			tagsCount: 0,
			attributesCount: 0,
			demoDataCount: 0,
		};

		try {
			return await ORM.getInstance().transaction(async () => {
				if (await this.datasetExists(dataset)) {
					throw new DuplicateContentTypeError(
						dataset.json.content_type.name,
					);
				}

				result.contentType = await this.importContentType(dataset);
				result.categoriesCount = await this.importCategories(
					result.contentType.id,
					dataset.json.categories,
				);

				const tagMap = await this.importTags(
					result.contentType.id,
					dataset.json.tags,
				);
				result.tagsCount = Object.keys(tagMap).length;

				result.attributesCount = await this.importMetadataAttributes(
					result.contentType.id,
					dataset.json.content_metadata_attributes,
				);

				if (
					options.includeDemoData &&
					dataset.json.demo_data?.length > 0
				) {
					result.demoDataCount = await this.importDemoData(
						result.contentType.id,
						dataset.json.demo_data,
						tagMap,
					);
				}

				result.success = true;
				return result;
			});
		} catch (error) {
			result.error = this.formatError(error);
			throw error;
		}
	}

	async importMultipleDatasets(
		datasets: Dataset[],
		options: ImportOptions,
	): Promise<BatchImportResult> {
		const result: BatchImportResult = {
			successful: 0,
			failed: 0,
			errors: [],
		};

		for (const dataset of datasets) {
			try {
				if (await this.datasetExists(dataset)) {
					console.warn(
						`Skipping "${dataset.json.content_type.name}" - already exists`,
					);
					continue;
				}

				await this.importDataset(dataset, options);
				result.successful++;
			} catch (error) {
				result.failed++;
				const errorMsg = `Failed to import "${
					dataset.title
				}": ${this.formatError(error)}`;
				result.errors.push(errorMsg);
				console.error(errorMsg);
			}
		}

		return result;
	}

	static async fetchDatasets(invalidate_cache?: boolean): Promise<Dataset[]> {
		return invoke('fetch_datasets', { invalidate_cache });
	}

	static async downloadDatasetImage(filename: string): Promise<string> {
		return await invoke('download_dataset_image', { filename });
	}

	private async datasetExists(dataset: Dataset): Promise<boolean> {
		const existing = await this.contentTypeRepo
			.query()
			.where('slug', dataset.id)
			.first();
		return !!existing;
	}

	private async importContentType(dataset: Dataset): Promise<ContentType> {
		const coverPath = await DatasetImporter.downloadDatasetImage(
			dataset.json.content_type.cover,
		);

		const contentTypeData = {
			name: dataset.json.content_type.name,
			slug: dataset.json.content_type.slug,
			file_type: dataset.json.content_type.file_type as any,
			description: dataset.json.content_type.description,
			cover: coverPath,
			icon: dataset.json.content_type.icon,
			order: dataset.json.content_type.order ?? 0,
			pinned: dataset.json.content_type.pinned ?? 0,
			docked: dataset.json.content_type.docked ?? 0,
			locked: dataset.json.content_type.locked ?? 0,
		};

		return await this.contentTypeRepo.create(contentTypeData);
	}

	private async importCategories(
		contentTypeId: number,
		categoriesData: CategoryData[],
	): Promise<number> {
		let count = 0;

		for (const categoryData of categoriesData) {
			await this.categoryRepo.create({
				content_type_id: contentTypeId,
				name: categoryData.name,
				slug: categoryData.slug,
				description: categoryData.description ?? null,
				cover: null,
				cover_gif: null,
			});
			count++;
		}

		return count;
	}

	private async importTags(
		contentTypeId: number,
		tagsData: TagData[],
	): Promise<Record<string, Tag>> {
		const tagMap: Record<string, Tag> = {};

		for (const tagData of tagsData) {
			const tag = await this.tagRepo.create({
				content_type_id: contentTypeId,
				name: tagData.name,
				slug: tagData.slug,
				description: tagData.description ?? null,
			});
			tagMap[tag.slug] = tag;
		}

		return tagMap;
	}

	private async importMetadataAttributes(
		contentTypeId: number,
		attributesData: MetadataAttributeData[],
	): Promise<number> {
		let count = 0;

		for (let order = 0; order < attributesData.length; order++) {
			const attrData = attributesData[order];
			await this.metaAttrRepo.create({
				content_type_id: contentTypeId,
				name: attrData.name,
				slug: attrData.slug,
				attribute_type: attrData.attribute_type as any,
				icon: attrData.icon,
				order,
				is_array: attrData.is_array ? 1 : 0,
				filterable: attrData.filterable ? 1 : 0,
				sortable: attrData.sortable ? 1 : 0,
				description: attrData.description ?? null,
			});
			count++;
		}

		return count;
	}

	private async importDemoData(
		contentTypeId: number,
		demoData: DemoContentData[],
		tagMap: Record<string, Tag>,
	): Promise<number> {
		let count = 0;

		for (const demoItem of demoData) {
			const category = await this.categoryRepo
				.query()
				.where('slug', demoItem.category_id)
				.first();
			if (!category) {
				throw new CategoryNotFoundError(
					demoItem.category_id,
					demoItem.name,
				);
			}

			const content = await this.createContent(
				contentTypeId,
				demoItem,
				category,
			);
			await this.associateTags(content, demoItem.tags, tagMap);
			await this.setMetadata(content.id, demoItem.metadata);
			count++;
		}

		return count;
	}

	private async createContent(
		contentTypeId: number,
		demoItem: DemoContentData,
		category: Category,
	): Promise<Content> {
		return await this.contentRepo.create({
			content_type_id: contentTypeId,
			category_id: category.id,
			file_id: null,
			name: demoItem.name,
			slug: demoItem.slug,
			description: demoItem.description ?? null,
			source_url: demoItem.source_url ?? null,
			scrape_url: demoItem.scrape_url ?? null,
			cover: demoItem.cover ?? null,
			cover_gif: demoItem.cover_gif ?? null,
			rating: demoItem.rating ?? 0,
			favorite: demoItem.favorite ?? 0,
			view_count: demoItem.view_count ?? 0,
			last_viewed_at: demoItem.last_viewed_at ?? null,
		});
	}

	private async associateTags(
		content: Content,
		tagSlugs: string[] | null,
		tagMap: Record<string, Tag>,
	): Promise<void> {
		if (!tagSlugs?.length) return;

		for (const tagSlug of tagSlugs) {
			const tag = tagMap[tagSlug];
			if (!tag) {
				console.warn(
					`Tag "${tagSlug}" not found for content "${content.name}", skipping`,
				);
				continue;
			}

			try {
				await this.contentRepo.associateTag(content, tag);
			} catch (error) {
				console.error(
					`Failed to associate tag "${tagSlug}" with "${content.name}":`,
					error,
				);
			}
		}
	}

	private async setMetadata(
		contentId: number,
		metadata: Record<string, any> | null,
	): Promise<void> {
		if (!metadata) return;

		const content = await this.contentRepo
			.query()
			.where('id', contentId)
			.with('contentType')
			.first();
		if (!content) throw new Error('Content not found');

		// Delete existing metadata
		const existing = await this.metaAttrValueRepo
			.query()
			.where('content_id', contentId)
			.get();
		for (const item of existing) {
			await item.delete();
		}

		for (const [key, value] of Object.entries(metadata)) {
			const attribute = await this.metaAttrRepo
				.query()
				.where('content_type_id', content.contentType.id)
				.where('slug', key)
				.first();
			if (!attribute) continue;

			await this.metaAttrValueRepo.create({
				content_id: contentId,
				attribute_id: attribute.id,
				value: JSON.stringify(value),
			});
		}
	}

	// ========================================================================
	// Helper Methods
	// ========================================================================

	private formatError(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}
}
