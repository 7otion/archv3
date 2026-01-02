import { useEffect, useState, useMemo, useCallback } from 'react';
import { MoveDownIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { z } from 'zod';
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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

import { useStore, useObservable } from '@/lib/store';
import { MetadataAttributesStore } from '@/lib/store/metadata-attributes';
import type { MetadataAttribute } from '@/lib/models/metadata-attribute';
import { useCurrentContentType } from '@/lib/hooks/use-current-content-type';
import { toastError } from '@/lib/utils';

import { MetadataAttributeRow } from './row';

const metadataAttributeSchema = z.object({
	name: z.string().min(1, { message: 'Name is required.' }),
	attribute_type: z.enum(['text', 'number', 'date', 'boolean', 'json']),
	icon: z.string().nullable().optional(),
	is_array: z.number(),
	filterable: z.number(),
	sortable: z.number(),
	description: z.string().nullable().optional(),
});

const MetadataAttributesPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [filterToggle, setFilterToggle] = useState(false);
	const [filterQuery, setFilterQuery] = useState('');
	const [editingIds, setEditingIds] = useState<Set<number | 'new'>>(
		new Set(),
	);
	const [editableData, setEditableData] = useState<
		Map<number | 'new', Partial<MetadataAttribute>>
	>(new Map());
	const [optimisticAttributes, setOptimisticAttributes] = useState<
		MetadataAttribute[]
	>([]);

	const sensors = useSensors(useSensor(PointerSensor));

	const currentContentType = useCurrentContentType();

	const metadataAttrStore = useStore(MetadataAttributesStore);
	const metadataAttributes = useObservable(metadataAttrStore.items);

	const displayAttributes =
		optimisticAttributes.length > 0
			? optimisticAttributes
			: metadataAttributes;

	const sortedAttributes = useMemo(() => {
		return [...displayAttributes].sort(
			(a, b) => (a.order || 0) - (b.order || 0),
		);
	}, [displayAttributes]);

	const filteredAttributes = useMemo(() => {
		if (!filterQuery.trim()) {
			return sortedAttributes;
		}

		const query = filterQuery.toLowerCase().trim();
		return sortedAttributes.filter(attribute => {
			const nameMatch = attribute.name.toLowerCase().includes(query);
			const typeMatch = attribute.attribute_type
				.toLowerCase()
				.includes(query);
			const descriptionMatch =
				attribute.description?.toLowerCase().includes(query) || false;
			return nameMatch || typeMatch || descriptionMatch;
		});
	}, [sortedAttributes, filterQuery]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				await metadataAttrStore.fetch();
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (!filterToggle) {
			setFilterQuery('');
		}
	}, [filterToggle]);

	const handleAddNew = useCallback(() => {
		const newAttribute: Partial<MetadataAttribute> = {
			name: '',
			attribute_type: 'text' as const,
			icon: null,
			is_array: 0,
			filterable: 0,
			sortable: 0,
			description: null,
		};
		setEditableData(prev => new Map(prev).set('new', newAttribute));
		setEditingIds(prev => new Set(prev).add('new'));
	}, []);

	const handleEdit = useCallback((attribute: MetadataAttribute) => {
		setEditableData(prev =>
			new Map(prev).set(attribute.id, {
				name: attribute.name,
				attribute_type: attribute.attribute_type,
				icon: attribute.icon,
				is_array: attribute.is_array,
				filterable: attribute.filterable,
				sortable: attribute.sortable,
				description: attribute.description,
			}),
		);
		setEditingIds(prev => new Set(prev).add(attribute.id));
	}, []);

	const handleSave = useCallback(
		async (id: number | 'new') => {
			const data = editableData.get(id);
			if (!data) return;

			const validation = metadataAttributeSchema.safeParse(data);
			if (!validation.success) {
				console.error('Validation error:', validation.error);
				return;
			}

			try {
				if (id === 'new') {
					if (!currentContentType) return;

					await metadataAttrStore.add({
						content_type_id: currentContentType.id,
						name: data.name!,
						attribute_type: data.attribute_type!,
						icon: data.icon,
						order: metadataAttributes.length + 1,
						is_array: data.is_array ? 1 : 0,
						filterable: data.filterable ? 1 : 0,
						sortable: data.sortable ? 1 : 0,
						description: data.description,
					});
				} else {
					await metadataAttrStore.update(id, {
						name: data.name!,
						attribute_type: data.attribute_type!,
						icon: data.icon,
						is_array: data.is_array ? 1 : 0,
						filterable: data.filterable ? 1 : 0,
						sortable: data.sortable ? 1 : 0,
						description: data.description,
					});
				}

				setEditingIds(prev => {
					const newSet = new Set(prev);
					newSet.delete(id);
					return newSet;
				});
				setEditableData(prev => {
					const newMap = new Map(prev);
					newMap.delete(id);
					return newMap;
				});
			} catch (error) {
				toastError(error, 'Error saving attribute');
			}
		},
		[editableData, currentContentType, metadataAttributes.length],
	);

	const handleCancel = useCallback((id: number | 'new') => {
		setEditingIds(prev => {
			const newSet = new Set(prev);
			newSet.delete(id);
			return newSet;
		});
		setEditableData(prev => {
			const newMap = new Map(prev);
			newMap.delete(id);
			return newMap;
		});
	}, []);

	// THIS IS THE KEY FIX: Memoize the update function per row ID
	const updateEditableField = useCallback(
		(id: number | 'new', field: keyof MetadataAttribute, value: any) => {
			setEditableData(prev => {
				const newMap = new Map(prev);
				const existing = newMap.get(id);
				if (existing) {
					newMap.set(id, { ...existing, [field]: value });
				}
				return newMap;
			});
		},
		[],
	);

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event;

			if (!over || active.id === over.id || filterToggle) {
				return;
			}

			const oldIndex = filteredAttributes.findIndex(
				attr => attr.id.toString() === active.id,
			);
			const newIndex = filteredAttributes.findIndex(
				attr => attr.id.toString() === over.id,
			);

			if (oldIndex === -1 || newIndex === -1) return;

			const reorderedAttributes = arrayMove(
				filteredAttributes,
				oldIndex,
				newIndex,
			);

			// Optimistic update
			const optimisticUpdates = reorderedAttributes.map(
				(attr, index) => ({
					...attr,
					order: index + 1,
				}),
			);

			setOptimisticAttributes(optimisticUpdates as any);

			try {
				await Promise.all(
					reorderedAttributes.map((attr, index) =>
						metadataAttrStore.update(attr.id, {
							...attr,
							order: index + 1,
						}),
					),
				);
				setOptimisticAttributes([]);
			} catch (error) {
				toastError(error, 'Error updating order');
				setOptimisticAttributes([]);
			}
		},
		[filteredAttributes, filterToggle],
	);

	return (
		<div className="h-screen">
			<div className="flex items-center justify-between sticky top-0 z-50 py-3 bg-background border-b">
				<div className="flex flex-col gap-1">
					<div className="flex items-baseline gap-2">
						<h1 className="font-bold">Metadata Attributes</h1>
						<p className="text-sm text-muted-foreground">
							Manage metadata attributes for "
							{currentContentType?.name}".
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
					placeholder="Filter attributes ..."
					value={filterQuery}
					onChange={e => setFilterQuery(e.target.value)}
				/>
			)}

			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loading />
					<span className="ml-2">Loading metadata attributes...</span>
				</div>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<Table className="overflow-hidden">
						<TableHeader>
							<TableRow>
								<TableHead className="w-10">
									<MoveDownIcon className="size-4 mx-auto" />
								</TableHead>
								<TableHead className="w-12">#</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Icon</TableHead>
								<TableHead>Array</TableHead>
								<TableHead>Filterable</TableHead>
								<TableHead>Sortable</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<SortableContext
								items={filteredAttributes.map(attr =>
									attr.id.toString(),
								)}
								strategy={verticalListSortingStrategy}
							>
								{editingIds.has('new') && (
									<MetadataAttributeRow
										isNew={true}
										isEditing={true}
										editData={editableData.get('new')}
										onEdit={handleEdit}
										onSave={handleSave}
										onCancel={handleCancel}
										onUpdateField={updateEditableField}
										order={filteredAttributes.length + 1}
										isFiltering={filterToggle}
									/>
								)}
								{filteredAttributes.map((attribute, index) => (
									<MetadataAttributeRow
										key={attribute.id}
										attribute={attribute}
										isEditing={editingIds.has(attribute.id)}
										editData={editableData.get(
											attribute.id,
										)}
										onEdit={handleEdit}
										onSave={handleSave}
										onCancel={handleCancel}
										onUpdateField={updateEditableField}
										order={index + 1}
										isFiltering={filterToggle}
									/>
								))}
							</SortableContext>
							{filteredAttributes.length === 0 &&
								!editingIds.has('new') && (
									<TableRow>
										<TableCell
											colSpan={10}
											className="text-center py-8"
										>
											{filterQuery.trim() ? (
												<>
													<p className="text-muted-foreground mb-4">
														No attributes found
														matching "{filterQuery}
														".
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
														No metadata attributes
														found for this content
														type.
													</p>
													<Button
														onClick={handleAddNew}
														variant="outline"
													>
														<PlusIcon className="h-4 w-4 mr-2" />
														Create your first
														attribute
													</Button>
												</>
											)}
										</TableCell>
									</TableRow>
								)}
						</TableBody>
					</Table>
				</DndContext>
			)}
		</div>
	);
};

export default MetadataAttributesPage;
