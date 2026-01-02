import { memo } from 'react';
import { EditIcon, SaveIcon, XIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { TableCell, TableRow } from '@/components/table';

import { useStore } from '@/lib/store';
import { DialogStore } from '@/lib/store/dialog';
import { TagsStore } from '@/lib/store/tags';
import type { Tag } from '@/lib/models/tag';

interface EditableTag {
	id?: number;
	name: string;
	description: string | null;
	isNew?: boolean;
}

interface TagRowProps {
	tag?: Tag;
	isNew?: boolean;
	isEditing: boolean;
	editData?: EditableTag;
	onEdit: (tag: Tag) => void;
	onSave: (id: number | 'new') => void;
	onCancel: (id: number | 'new') => void;
	onUpdateField: (
		id: number | 'new',
		field: keyof EditableTag,
		value: any,
	) => void;
}

export const TagRow = memo<TagRowProps>(
	({
		tag,
		isNew = false,
		isEditing,
		editData,
		onEdit,
		onSave,
		onCancel,
		onUpdateField,
	}) => {
		const tagsStore = useStore(TagsStore);
		const dialogStore = useStore(DialogStore);

		const id = isNew ? 'new' : tag?.id;

		const handleDelete = () => {
			if (tag) {
				tagsStore.setSelected(tag);
				dialogStore.openDialog('tag-delete');
			}
		};

		if (!id || (!isNew && !tag)) return null;

		return (
			<TableRow>
				<TableCell>
					{isEditing ? (
						<Input
							value={editData?.name || ''}
							onChange={e =>
								onUpdateField(id, 'name', e.target.value)
							}
							placeholder="Tag name"
						/>
					) : (
						tag?.name
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
						tag?.description || '-'
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
									onClick={() => tag && onEdit(tag)}
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
			prevProps.tag?.id === nextProps.tag?.id &&
			prevProps.tag?.name === nextProps.tag?.name &&
			prevProps.tag?.description === nextProps.tag?.description &&
			(!nextProps.isEditing ||
				(prevProps.editData?.name === nextProps.editData?.name &&
					prevProps.editData?.description ===
						nextProps.editData?.description))
		);
	},
);
