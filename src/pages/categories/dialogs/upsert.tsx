import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { NativeFileInput } from '@7otion/tauri-file-uploader';

import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/dialog';
import { Button } from '@/components/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { Label } from '@/components/label';

import { useCategoriesStore } from '@/lib/store/categories';
import { useContentTypesStore } from '@/lib/store/content-types';
import { useDialogStore } from '@/lib/store/dialog';
import { toastError } from '@/lib/utils';
import { FileIPC } from '@/lib/services/file';

const categorySchema = z.object({
	name: z.string().min(1, { message: 'Name is required.' }),
	description: z.string().optional(),
	cover: z.string().optional(),
	cover_gif: z.string().optional(),
});

type FormData = z.infer<typeof categorySchema>;

export default function UpsertCategory() {
	const [isLoading, setIsLoading] = useState(false);

	const selectedContentType = useContentTypesStore(
		state => state.selectedItem,
	);
	const selectedCategory = useCategoriesStore(state => state.selectedItem);
	const closeDialog = useDialogStore(state => state.closeDialog);
	const addCategory = useCategoriesStore(state => state.add);
	const updateCategory = useCategoriesStore(state => state.update);

	const isEditing = !!selectedCategory;
	const form = useForm<FormData>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: '',
			description: '',
			cover: '',
			cover_gif: '',
		},
	});

	const { reset, setValue } = form;

	useEffect(() => {
		if (selectedCategory && selectedCategory.id) {
			const values = {
				name: selectedCategory.name,
				description: selectedCategory.description || '',
				cover: '',
				cover_gif: '',
			};
			reset(values);
		}
	}, [selectedCategory, reset]);

	const handleCoverFileChange = async (file: any) => {
		setValue('cover', file.path);
		return true;
	};

	const handleCoverGIFFileChange = async (file: any) => {
		setValue('cover_gif', file.path);
		return true;
	};

	const handleCoverFile = async (cover_file_path: string) => {
		const coverFolder = await FileIPC.coverFolderPath();
		const contentTypeCoverPath = `${coverFolder}/categories`;
		const uniqueFileName = `${uuidv4()}.${cover_file_path
			.split('.')
			.pop()}`;
		const copied_file_path = await FileIPC.copyFile(
			cover_file_path,
			contentTypeCoverPath,
			uniqueFileName,
		);
		return copied_file_path;
	};

	const onSubmit = async (data: FormData) => {
		if (!selectedContentType) {
			toast.error('No content type selected');
			return;
		}

		setIsLoading(true);

		try {
			if (isEditing && selectedCategory) {
				const oldCover = selectedCategory.cover;
				let newCoverAdded = false;
				let finalCoverPath = selectedCategory.cover;

				if (data.cover && data.cover !== selectedCategory.cover) {
					finalCoverPath = await handleCoverFile(data.cover);
					newCoverAdded = true;
				}

				const oldCoverGIF = selectedCategory.cover_gif;
				let newCoverGIFAdded = false;
				let finalCoverGIFPath = selectedCategory.cover_gif;

				if (
					data.cover_gif &&
					data.cover_gif !== selectedCategory.cover_gif
				) {
					finalCoverGIFPath = await handleCoverFile(data.cover_gif);
					newCoverGIFAdded = true;
				}

				await updateCategory(selectedCategory.id, {
					name: data.name,
					description: data.description || null,
					cover: finalCoverPath,
					cover_gif: finalCoverGIFPath,
				});

				if (
					typeof oldCover === 'string' &&
					oldCover !== '' &&
					newCoverAdded
				) {
					await FileIPC.trash(oldCover);
				}

				if (
					typeof oldCoverGIF === 'string' &&
					oldCoverGIF !== '' &&
					newCoverGIFAdded
				) {
					await FileIPC.trash(oldCoverGIF);
				}

				toast.success(`"${data.name}" has been updated successfully`);
			} else {
				if (data.cover && data.cover !== '') {
					data.cover = await handleCoverFile(data.cover);
				}
				if (data.cover_gif && data.cover_gif !== '') {
					data.cover_gif = await handleCoverFile(data.cover_gif);
				}

				await addCategory({
					content_type_id: selectedContentType.id,
					name: data.name,
					description: data.description || null,
					cover: data.cover || null,
					cover_gif: data.cover_gif || null,
				});
				toast.success(`"${data.name}" has been created successfully`);
			}

			closeDialog();
		} catch (error) {
			toastError(error, 'Failed to save category');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Edit' : 'Create'} Category
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? 'Update the category details.'
							: 'Create a new category to organize your content.'}
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[65vh] overflow-y-auto pr-2 py-4 flex flex-col gap-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter category name"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Describe what this category is for"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid gap-2">
						<Label>Cover Image</Label>
						<NativeFileInput
							onFileChange={handleCoverFileChange}
							dialogTitle="Select Cover Image"
							extensionFilter={[
								'jpg',
								'jpeg',
								'png',
								'webp',
								'avif',
							]}
							mode="file"
						/>
						<p className="text-xs text-muted-foreground">
							Optional: Upload a cover image for this category
						</p>
					</div>

					<div className="grid gap-2">
						<Label>Cover GIF</Label>
						<NativeFileInput
							onFileChange={handleCoverGIFFileChange}
							dialogTitle="Select Cover GIF"
							extensionFilter={['gif']}
							mode="file"
						/>
						<p className="text-xs text-muted-foreground">
							Optional: Upload a cover gif for this category
						</p>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={closeDialog}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="info"
							disabled={isLoading}
						>
							{isLoading
								? isEditing
									? 'Updating...'
									: 'Creating...'
								: isEditing
									? 'Update'
									: 'Create'}
						</Button>
					</DialogFooter>
				</div>
			</form>
		</Form>
	);
}
