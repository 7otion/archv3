import { memo } from 'react';
import { EditIcon, SaveIcon, XIcon, Trash2Icon, GripIcon } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { TableCell, TableRow } from '@/components/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import { Checkbox } from '@/components/checkbox';

import {
	MetadataAttribute,
	type AttributeType,
} from '@/lib/models/metadata-attribute';
import { useDialogStore } from '@/lib/store/dialog';
import { useMetadataAttributesStore } from '@/lib/store/metadata-attributes';

const ATTRIBUTE_TYPES: { value: AttributeType; label: string }[] = [
	{ value: 'text', label: 'Text' },
	{ value: 'number', label: 'Number' },
	{ value: 'date', label: 'Date' },
	{ value: 'boolean', label: 'Boolean' },
	{ value: 'json', label: 'JSON' },
];

interface MetadataAttributeRowProps {
	attribute?: MetadataAttribute;
	isNew?: boolean;
	isEditing: boolean;
	editData?: Partial<MetadataAttribute>;
	onEdit: (attribute: MetadataAttribute) => void;
	onSave: (id: number | 'new') => void;
	onCancel: (id: number | 'new') => void;
	onUpdateField: (
		id: number | 'new',
		field: keyof MetadataAttribute,
		value: any,
	) => void;
	order: number;
	isFiltering?: boolean;
}

export const MetadataAttributeRow = memo<MetadataAttributeRowProps>(
	({
		attribute,
		isNew = false,
		isEditing,
		editData,
		onEdit,
		onSave,
		onCancel,
		onUpdateField,
		order,
		isFiltering = false,
	}) => {
		const setSelectedMetadataAttribute = useMetadataAttributesStore(
			state => state.setSelected,
		);
		const openDialog = useDialogStore(state => state.openDialog);

		const handleDelete = () => {
			if (attribute) {
				setSelectedMetadataAttribute(attribute);
				openDialog('metadata-attribute-delete');
			}
		};

		const id = isNew ? 'new' : attribute?.id;

		const {
			attributes,
			listeners,
			setNodeRef,
			transform,
			transition,
			isDragging,
		} = useSortable({
			id: attribute?.id?.toString() || 'new',
			disabled: isNew || isEditing || isFiltering,
		});

		const style = {
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? 0.5 : 1,
			position: 'relative' as const,
			zIndex: isDragging ? 1000 : 'auto',
		};

		if (!id || (!isNew && !attribute)) return null;

		return (
			<TableRow ref={setNodeRef} style={style} {...attributes}>
				<TableCell>
					{!isNew && !isEditing ? (
						<Button
							variant="ghost"
							size="icon"
							{...listeners}
							className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
						>
							<GripIcon className="text-gray-400" />
						</Button>
					) : (
						<div className="size-4" />
					)}
				</TableCell>
				<TableCell>
					<span className="text-sm text-muted-foreground font-mono">
						{order}
					</span>
				</TableCell>
				<TableCell>
					{isEditing ? (
						<Input
							value={editData?.name || ''}
							onChange={e =>
								onUpdateField(id, 'name', e.target.value)
							}
							placeholder="Attribute name"
						/>
					) : (
						attribute?.name
					)}
				</TableCell>
				<TableCell>
					{isEditing ? (
						<Select
							value={editData?.attribute_type || 'text'}
							onValueChange={value =>
								onUpdateField(
									id,
									'attribute_type',
									value as AttributeType,
								)
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ATTRIBUTE_TYPES.map(type => (
									<SelectItem
										key={type.value}
										value={type.value}
									>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<span className="capitalize">
							{attribute?.attribute_type}
						</span>
					)}
				</TableCell>
				<TableCell>
					{isEditing ? (
						<Input
							value={editData?.icon || ''}
							onChange={e =>
								onUpdateField(
									id,
									'icon',
									e.target.value || null,
								)
							}
							placeholder="Icon"
						/>
					) : (
						attribute?.icon || '-'
					)}
				</TableCell>
				<TableCell>
					{isEditing ? (
						<Checkbox
							checked={!!editData?.is_array}
							onCheckedChange={checked =>
								onUpdateField(id, 'is_array', checked ? 1 : 0)
							}
						/>
					) : (
						<Checkbox checked={!!attribute?.isArray} disabled />
					)}
				</TableCell>
				<TableCell>
					{isEditing ? (
						<Checkbox
							checked={!!editData?.filterable}
							onCheckedChange={checked =>
								onUpdateField(id, 'filterable', checked ? 1 : 0)
							}
						/>
					) : (
						<Checkbox
							checked={!!attribute?.isFilterable}
							disabled
						/>
					)}
				</TableCell>
				<TableCell>
					{isEditing ? (
						<Checkbox
							checked={!!editData?.sortable}
							onCheckedChange={checked =>
								onUpdateField(id, 'sortable', checked ? 1 : 0)
							}
						/>
					) : (
						<Checkbox checked={!!attribute?.isSortable} disabled />
					)}
				</TableCell>
				<TableCell>
					{isEditing ? (
						<Input
							value={editData?.description || ''}
							onChange={e =>
								onUpdateField(
									id,
									'description',
									e.target.value || null,
								)
							}
							placeholder="Description"
						/>
					) : (
						attribute?.description || '-'
					)}
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-2">
						{isEditing ? (
							<>
								<Button size="sm" onClick={() => onSave(id)}>
									<SaveIcon className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => onCancel(id)}
								>
									<XIcon className="h-4 w-4" />
								</Button>
							</>
						) : (
							<>
								<Button
									size="sm"
									variant="outline"
									onClick={() =>
										attribute && onEdit(attribute)
									}
								>
									<EditIcon className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={handleDelete}
								>
									<Trash2Icon className="h-4 w-4" />
								</Button>
							</>
						)}
					</div>
				</TableCell>
			</TableRow>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.isEditing === nextProps.isEditing &&
			prevProps.isNew === nextProps.isNew &&
			prevProps.order === nextProps.order &&
			prevProps.isFiltering === nextProps.isFiltering &&
			prevProps.attribute?.id === nextProps.attribute?.id &&
			prevProps.attribute?.name === nextProps.attribute?.name &&
			prevProps.attribute?.attribute_type ===
				nextProps.attribute?.attribute_type &&
			prevProps.attribute?.order === nextProps.attribute?.order &&
			(!nextProps.isEditing ||
				(prevProps.editData?.name === nextProps.editData?.name &&
					prevProps.editData?.attribute_type ===
						nextProps.editData?.attribute_type &&
					prevProps.editData?.icon === nextProps.editData?.icon &&
					prevProps.editData?.is_array ===
						nextProps.editData?.is_array &&
					prevProps.editData?.filterable ===
						nextProps.editData?.filterable &&
					prevProps.editData?.sortable ===
						nextProps.editData?.sortable &&
					prevProps.editData?.description ===
						nextProps.editData?.description))
		);
	},
);
