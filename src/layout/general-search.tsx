import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import {
	Search,
	File,
	FolderIcon,
	ImageIcon,
	FilmIcon,
	FileTextIcon,
} from 'lucide-react';

import { Button } from '@/components/button';
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/command';

// Dummy search results data
const dummySearchResults = [
	// Files
	{
		type: 'file',
		title: 'project-notes.txt',
		path: '/documents/project-notes.txt',
		size: '2.3 KB',
		modified: '2 hours ago',
	},
	{
		type: 'file',
		title: 'budget-2024.xlsx',
		path: '/spreadsheets/budget-2024.xlsx',
		size: '145 KB',
		modified: '1 day ago',
	},
	{
		type: 'file',
		title: 'presentation.pptx',
		path: '/presentations/presentation.pptx',
		size: '5.2 MB',
		modified: '3 days ago',
	},

	// Images
	{
		type: 'image',
		title: 'logo-design.png',
		path: '/images/logo-design.png',
		size: '890 KB',
		modified: '1 week ago',
	},
	{
		type: 'image',
		title: 'screenshot-app.jpg',
		path: '/screenshots/screenshot-app.jpg',
		size: '234 KB',
		modified: '2 days ago',
	},

	// Videos
	{
		type: 'video',
		title: 'demo-recording.mp4',
		path: '/videos/demo-recording.mp4',
		size: '12.5 MB',
		modified: '5 days ago',
	},
	{
		type: 'video',
		title: 'tutorial-part1.mov',
		path: '/videos/tutorial-part1.mov',
		size: '45.2 MB',
		modified: '1 week ago',
	},

	// Content entries
	{
		type: 'content',
		title: 'Blog Post: Getting Started',
		category: 'Articles',
		created: '2024-05-20',
		author: 'John Doe',
	},
	{
		type: 'content',
		title: 'Product Review: Camera X1',
		category: 'Reviews',
		created: '2024-05-18',
		author: 'Jane Smith',
	},
	{
		type: 'content',
		title: 'Tutorial: React Basics',
		category: 'Tutorials',
		created: '2024-05-15',
		author: 'Mike Johnson',
	},

	// Folders
	{
		type: 'folder',
		title: 'Project Assets',
		path: '/projects/assets',
		items: '24 items',
		modified: '1 day ago',
	},
	{
		type: 'folder',
		title: 'Archive 2023',
		path: '/archive/2023',
		items: '156 items',
		modified: '2 weeks ago',
	},
];

export function GeneralSearch({ ...props }: DialogProps) {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState('');

	const runCommand = React.useCallback((command: () => unknown) => {
		setOpen(false);
		command();
	}, []);

	const getIconForType = (type: string) => {
		switch (type) {
			case 'file':
				return <File className="mr-2 size-4" />;
			case 'image':
				return <ImageIcon className="mr-2 size-4" />;
			case 'video':
				return <FilmIcon className="mr-2 size-4" />;
			case 'content':
				return <FileTextIcon className="mr-2 size-4" />;
			case 'folder':
				return <FolderIcon className="mr-2 size-4" />;
			default:
				return <File className="mr-2 size-4" />;
		}
	};

	const filteredResults = dummySearchResults.filter(
		item =>
			item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(item.path &&
				item.path.toLowerCase().includes(searchQuery.toLowerCase())) ||
			(item.category &&
				item.category
					.toLowerCase()
					.includes(searchQuery.toLowerCase())),
	);

	const groupedResults = {
		files: filteredResults.filter(item => item.type === 'file'),
		images: filteredResults.filter(item => item.type === 'image'),
		videos: filteredResults.filter(item => item.type === 'video'),
		content: filteredResults.filter(item => item.type === 'content'),
		folders: filteredResults.filter(item => item.type === 'folder'),
	};

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="clickable-content size-7 px-0 rounded-none"
				onClick={() => setOpen(true)}
				{...props}
			>
				<Search className="size-[0.95rem]" />
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput
					placeholder="Search files, content, images, videos..."
					value={searchQuery}
					onValueChange={setSearchQuery}
				/>
				<CommandList>
					<CommandEmpty>
						No results found for "{searchQuery}"
					</CommandEmpty>

					{groupedResults.files.length > 0 && (
						<CommandGroup heading="Files">
							{groupedResults.files.map((item, index) => (
								<CommandItem
									key={`file-${index}`}
									value={item.title}
									className="flex items-center justify-between py-1.5 px-2 border-b border-border/40 last:border-b-0"
									onSelect={() => {
										runCommand(() => {
											console.log(
												`Opening file: ${item.path}`,
											);
											// Replace with actual file opening logic
										});
									}}
								>
									<div className="flex items-center min-w-0 flex-1">
										{getIconForType(item.type)}
										<span className="truncate pr-2">
											{item.title}
										</span>
									</div>
									<div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
										<span>{item.size}</span>
										<span>•</span>
										<span>{item.modified}</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}

					<CommandSeparator className="my-2" />

					{groupedResults.images.length > 0 && (
						<CommandGroup heading="Images">
							{groupedResults.images.map((item, index) => (
								<CommandItem
									key={`image-${index}`}
									value={item.title}
									className="flex items-center justify-between py-1.5 px-2 border-b border-border/40 last:border-b-0"
									onSelect={() => {
										runCommand(() => {
											console.log(
												`Opening image: ${item.path}`,
											);
											// Replace with actual image opening logic
										});
									}}
								>
									<div className="flex items-center min-w-0 flex-1">
										{getIconForType(item.type)}
										<span className="truncate pr-2">
											{item.title}
										</span>
									</div>
									<div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
										<span>{item.size}</span>
										<span>•</span>
										<span>{item.modified}</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}

					<CommandSeparator className="my-2" />

					{groupedResults.videos.length > 0 && (
						<CommandGroup heading="Videos">
							{groupedResults.videos.map((item, index) => (
								<CommandItem
									key={`video-${index}`}
									value={item.title}
									className="flex items-center justify-between py-1.5 px-2 border-b border-border/40 last:border-b-0"
									onSelect={() => {
										runCommand(() => {
											console.log(
												`Opening video: ${item.path}`,
											);
											// Replace with actual video opening logic
										});
									}}
								>
									<div className="flex items-center min-w-0 flex-1">
										{getIconForType(item.type)}
										<span className="truncate pr-2">
											{item.title}
										</span>
									</div>
									<div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
										<span>{item.size}</span>
										<span>•</span>
										<span>{item.modified}</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}

					<CommandSeparator className="my-2" />

					{groupedResults.content.length > 0 && (
						<CommandGroup heading="Content">
							{groupedResults.content.map((item, index) => (
								<CommandItem
									key={`content-${index}`}
									value={item.title}
									className="flex items-center justify-between py-1.5 px-2 border-b border-border/40 last:border-b-0"
									onSelect={() => {
										runCommand(() => {
											console.log(
												`Opening content: ${item.title}`,
											);
											// Replace with actual content opening logic
										});
									}}
								>
									<div className="flex items-center min-w-0 flex-1">
										{getIconForType(item.type)}
										<span className="truncate pr-2">
											{item.title}
										</span>
									</div>
									<div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
										<span>{item.category}</span>
										<span>•</span>
										<span>{item.author}</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}

					<CommandSeparator className="my-2" />

					{groupedResults.folders.length > 0 && (
						<CommandGroup heading="Folders">
							{groupedResults.folders.map((item, index) => (
								<CommandItem
									key={`folder-${index}`}
									value={item.title}
									className="flex items-center justify-between py-1.5 px-2 border-b border-border/40 last:border-b-0"
									onSelect={() => {
										runCommand(() => {
											console.log(
												`Opening folder: ${item.path}`,
											);
											// Replace with actual folder opening logic
										});
									}}
								>
									<div className="flex items-center min-w-0 flex-1">
										{getIconForType(item.type)}
										<span className="truncate pr-2">
											{item.title}
										</span>
									</div>
									<div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
										<span>{item.items}</span>
										<span>•</span>
										<span>{item.modified}</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</CommandList>
			</CommandDialog>
		</>
	);
}
