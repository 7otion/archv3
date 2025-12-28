import { useEffect, useState, useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { z } from 'zod';
import { useRoute } from 'wouter';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Toggle } from '@/components/toggle';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/table';
import { LayoutBreadcrumb } from '@/layout/breadcrumb';

import { useTagsStore } from '@/lib/store/tags';
import { useContentTypesStore } from '@/lib/store/content-types';
import { Tag } from '@/lib/models/tag';
import { toastError } from '@/lib/utils';

import { TagRow } from './row';

const tagSchema = z.object({
	name: z.string().min(1, { message: 'Name is required.' }),
	description: z.string().optional().nullable(),
});

interface EditableTag {
	id?: number;
	name: string;
	description: string | null;
	isNew?: boolean;
}

const TagsPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [filterToggle, setFilterToggle] = useState(false);
	const [filterQuery, setFilterQuery] = useState('');
	const [editingIds, setEditingIds] = useState<Set<number | 'new'>>(
		new Set(),
	);
	const [editableData, setEditableData] = useState<
		Map<number | 'new', EditableTag>
	>(new Map());

	const contentTypes = useContentTypesStore(state => state.items);
	const [, params] = useRoute('/content-types/:contentType/manage');
	const currentContentType = params?.contentType
		? contentTypes.find(ct => ct.slug === params.contentType)
		: undefined;

	const [tags, fetchTags, addTag, updateTag] = useTagsStore(
		useShallow(state => [
			state.items,
			state.fetch,
			state.add,
			state.update,
		]),
	);

	const filteredTags = useMemo(() => {
		if (!filterQuery.trim()) {
			return tags;
		}

		const query = filterQuery.toLowerCase().trim();
		return tags.filter(tag => {
			const nameMatch = tag.name.toLowerCase().includes(query);
			const descriptionMatch =
				tag.description?.toLowerCase().includes(query) || false;
			return nameMatch || descriptionMatch;
		});
	}, [tags, filterQuery]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				await fetchTags();
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [fetchTags]);

	useEffect(() => {
		if (!filterToggle) {
			setFilterQuery('');
		}
	}, [filterToggle]);

	const handleEdit = useCallback((tag: Tag) => {
		const editableTag: EditableTag = {
			id: tag.id,
			name: tag.name,
			description: tag.description,
		};

		setEditableData(prev => new Map(prev).set(tag.id, editableTag));
		setEditingIds(prev => new Set(prev).add(tag.id));
	}, []);

	const handleCancel = useCallback((id: number | 'new') => {
		setEditableData(prev => {
			const newMap = new Map(prev);
			newMap.delete(id);
			return newMap;
		});
		setEditingIds(prev => {
			const newSet = new Set(prev);
			newSet.delete(id);
			return newSet;
		});
	}, []);

	const handleSave = useCallback(
		async (id: number | 'new') => {
			const data = editableData.get(id);
			if (!data) return;

			try {
				const validationResult = tagSchema.safeParse(data);
				if (!validationResult.success) {
					toastError(
						'Validation Error: ' + validationResult.error.message,
					);
					return;
				}

				if (id === 'new') {
					if (!currentContentType) return;

					await addTag({
						content_type_id: currentContentType.id,
						name: data.name,
						slug: data.name.toLowerCase().replace(/\s+/g, '-'),
						description: data.description,
					});
				} else {
					const existingTag = tags.find(tag => tag.id === id);
					if (existingTag) {
						await updateTag(existingTag.id, {
							name: data.name,
							slug: data.name.toLowerCase().replace(/\s+/g, '-'),
							description: data.description,
						});
					}
				}

				handleCancel(id);
			} catch (error) {
				toastError(error, 'Error saving tag');
			}
		},
		[
			editableData,
			currentContentType,
			tags,
			addTag,
			updateTag,
			handleCancel,
		],
	);

	const handleAddNew = useCallback(() => {
		const newTag: EditableTag = {
			name: '',
			description: null,
			isNew: true,
		};
		setEditableData(prev => new Map(prev).set('new', newTag));
		setEditingIds(prev => new Set(prev).add('new'));
	}, []);

	const updateEditableField = useCallback(
		(id: number | 'new', field: keyof EditableTag, value: any) => {
			setEditableData(prev => {
				const newMap = new Map(prev);
				const current = newMap.get(id);
				if (current) {
					newMap.set(id, { ...current, [field]: value });
				}
				return newMap;
			});
		},
		[],
	);

	return (
		<div className="h-screen">
			<div className="flex items-center justify-between sticky top-0 z-50 py-3 bg-background border-b">
				<div className="flex flex-col gap-1">
					<div className="flex items-baseline gap-2">
						<h1 className="font-bold">Tags</h1>
						<p className="text-sm text-muted-foreground">
							Manage tags for "{currentContentType?.name}".
						</p>
					</div>
					<LayoutBreadcrumb />
				</div>
				<div className="flex items-center gap-2">
					<Toggle
						pressed={!!filterToggle}
						onPressedChange={setFilterToggle}
						aria-label="Filter Mode"
					>
						<SearchIcon />
					</Toggle>

					<Button
						variant="outline"
						size="icon"
						onClick={handleAddNew}
					>
						<PlusIcon />
					</Button>
				</div>
			</div>

			{filterToggle && (
				<Input
					className="mt-4 mb-2"
					placeholder="Filter tags ..."
					value={filterQuery}
					onChange={e => setFilterQuery(e.target.value)}
				/>
			)}

			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loading />
					<span className="ml-2">Loading tags...</span>
				</div>
			) : (
				<div className="py-3">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{editingIds.has('new') && (
								<TagRow
									isNew={true}
									isEditing={true}
									editData={editableData.get('new')}
									onEdit={handleEdit}
									onSave={handleSave}
									onCancel={handleCancel}
									onUpdateField={updateEditableField}
								/>
							)}
							{filteredTags.map(tag => (
								<TagRow
									key={tag.id}
									tag={tag}
									isEditing={editingIds.has(tag.id)}
									editData={editableData.get(tag.id)}
									onEdit={handleEdit}
									onSave={handleSave}
									onCancel={handleCancel}
									onUpdateField={updateEditableField}
								/>
							))}
							{filteredTags.length === 0 &&
								!editingIds.has('new') && (
									<TableRow>
										<TableCell
											colSpan={3}
											className="text-center py-8"
										>
											{filterQuery.trim() ? (
												<>
													<p className="text-muted-foreground mb-4">
														No tags found matching "
														{filterQuery}".
													</p>
													<Button
														onClick={() =>
															setFilterQuery('')
														}
														variant="outline"
													>
														Clear filter
													</Button>
												</>
											) : (
												<>
													<p className="text-muted-foreground mb-4">
														No tags found for this
														content type.
													</p>
													<Button
														onClick={handleAddNew}
														variant="outline"
													>
														<PlusIcon className="h-4 w-4 mr-2" />
														Create your first tag
													</Button>
												</>
											)}
										</TableCell>
									</TableRow>
								)}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
};

export default TagsPage;
