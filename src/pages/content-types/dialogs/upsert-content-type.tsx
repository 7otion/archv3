import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
	BoxIcon,
	ImageIcon,
	LayoutGridIcon,
	TypeIcon,
	VideoIcon,
} from 'lucide-react';
import { NativeFileInput } from '@7otion/tauri-file-uploader';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Textarea } from '@/components/textarea';
import { Switch } from '@/components/switch';
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import { IconPicker } from '@/components/iconify/picker';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';

import { useContentTypesStore } from '@/lib/store/content-types';
import { useDialogStore } from '@/lib/store/dialog';
import { toastError } from '@/lib/utils';
import { FileIPC } from '@/lib/services/file';

const contentTypeSchema = z.object({
	name: z.string().min(1, { message: 'Name is required.' }),
	file_type: z.enum(['video', 'image', 'binary', 'document', 'other']),
	description: z.string().optional(),
	icon: z.string().optional(),
	cover: z.string().optional(),
	pinned: z.boolean().optional(),
	docked: z.boolean().optional(),
	locked: z.boolean().optional(),
});

type FormData = z.infer<typeof contentTypeSchema>;

export default function UpsertContentType() {
	const [isLoading, setIsLoading] = useState(false);

	const [selectedContentType, updateContentType, addContentType] =
		useContentTypesStore(
			useShallow(state => [state.selectedItem, state.update, state.add]),
		);

	const closeDialog = useDialogStore(state => state.closeDialog);

	const isEditing = !!selectedContentType;
	const form = useForm<FormData>({
		resolver: zodResolver(contentTypeSchema),
		defaultValues: {
			name: '',
			file_type: 'video',
			description: '',
			icon: '',
			cover: '',
			pinned: false,
			docked: false,
			locked: false,
		},
	});

	const { reset, setValue } = form;

	useEffect(() => {
		if (selectedContentType && selectedContentType.id) {
			const values = {
				name: selectedContentType.name,
				file_type: selectedContentType.file_type,
				description: selectedContentType.description || '',
				icon: selectedContentType.icon || '',
				pinned: !!selectedContentType.pinned,
				docked: !!selectedContentType.docked,
				locked: !!selectedContentType.locked,
			};
			reset(values);
		}
	}, [selectedContentType]);

	const handleCoverFile = async (cover_file_path: string) => {
		const coverFolder = await FileIPC.coverFolderPath();
		const contentTypeCoverPath = `${coverFolder}/content-type`;
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
		setIsLoading(true);

		try {
			if (isEditing && selectedContentType) {
				const oldCover = selectedContentType.cover;
				let finalCoverPath = selectedContentType.cover;

				if (data.cover && data.cover !== selectedContentType.cover) {
					finalCoverPath = await handleCoverFile(data.cover);

					// Clean up old cover after successful copy
					if (typeof oldCover === 'string' && oldCover !== '') {
						await FileIPC.trash(oldCover);
					}
				}

				await updateContentType(selectedContentType.id, {
					name: data.name,
					file_type: data.file_type,
					description: data.description || null,
					icon: data.icon || null,
					cover: finalCoverPath,
					pinned: data.pinned ? 1 : 0,
					docked: data.docked ? 1 : 0,
					locked: data.locked ? 1 : 0,
				});

				toast.success(`"${data.name}" has been updated successfully`);
			} else {
				if (data.cover && data.cover !== '') {
					data.cover = await handleCoverFile(data.cover);
				}

				await addContentType({
					name: data.name,
					file_type: data.file_type,
					description: data.description || null,
					icon: data.icon || null,
					cover: data.cover,
					order: null,
					pinned: data.pinned ? 1 : 0,
					docked: data.docked ? 1 : 0,
					locked: data.locked ? 1 : 0,
				});
				toast.success(`"${data.name}" has been created successfully`);
			}

			closeDialog();
		} catch (error) {
			toastError(
				error,
				`Failed to ${isEditing ? 'update' : 'create'} content type`,
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileChange = async (file: any) => {
		setValue('cover', file.path);
		return true;
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Edit' : 'Create'} Content Type
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? 'Update the content type details.'
							: 'Create a new content type to organize your content.'}
					</DialogDescription>
				</DialogHeader>

				<div className="h-[60vh] overflow-y-auto pr-2">
					<div className="grid gap-4 py-4">
						<div className="flex items-center gap-3">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="grow">
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Movies, Books, Podcasts"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="icon"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Icon</FormLabel>
										<FormControl>
											<IconPicker
												value={field.value}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe what this content type is for"
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
								onFileChange={handleFileChange}
								dialogTitle="Select Cover Image"
								ButtonComponent={Button as any}
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
								Optional: Upload a cover image for this content
								type
							</p>
						</div>

						<FormField
							control={form.control}
							name="file_type"
							render={({ field, fieldState }) => (
								<FormItem className="grow">
									<FormLabel>File Type</FormLabel>
									<FormControl>
										<Select
											key={field.value}
											value={field.value}
											defaultValue={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger
												ref={field.ref}
												aria-invalid={
													fieldState['invalid']
												}
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="video">
													<VideoIcon /> Video
												</SelectItem>
												<SelectItem value="image">
													<ImageIcon /> Image
												</SelectItem>
												<SelectItem value="binary">
													<LayoutGridIcon /> Binary
												</SelectItem>
												<SelectItem value="document">
													<TypeIcon /> Document
												</SelectItem>
												<SelectItem value="other">
													<BoxIcon /> Other
												</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
								</FormItem>
							)}
						/>
						<div className="grid gap-4 pt-2">
							<FormField
								control={form.control}
								name="pinned"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between">
										<div className="space-y-0.5">
											<FormLabel>Pin to top</FormLabel>
											<p className="text-xs text-muted-foreground">
												Pinned content types appear at
												the top
											</p>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="docked"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between">
										<div className="space-y-0.5">
											<FormLabel>Add to dock</FormLabel>
											<p className="text-xs text-muted-foreground">
												Docked content types appear in
												the app's dock
											</p>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="locked"
								render={({ field }) => (
									<FormItem className="flex items-center justify-between">
										<div className="space-y-0.5">
											<FormLabel>Lock content</FormLabel>
											<p className="text-xs text-muted-foreground">
												Locked content types are only
												accessible after unlocking
											</p>
										</div>
										<FormControl>
											<Switch
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
					</div>
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
					<Button type="submit" disabled={isLoading}>
						{isLoading
							? isEditing
								? 'Updating...'
								: 'Creating...'
							: isEditing
								? 'Update'
								: 'Create'}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
