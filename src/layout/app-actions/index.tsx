import {
	WrenchIcon,
	SearchIcon,
	FilmIcon,
	ImageIcon,
	RefreshCwIcon,
	CropIcon,
	Wand2Icon,
	ImagePlusIcon,
	TypeIcon,
	FileArchiveIcon,
	FolderOpenIcon,
	FileIcon,
	PlusIcon,
	DatabaseIcon,
	ScanLineIcon,
	KeyIcon,
	PlugIcon,
	SettingsIcon,
	InfoIcon,
	ScrollTextIcon,
	ListIcon,
	FileTextIcon,
	RefreshCcwIcon,
	ScaleIcon,
	ImageUpscaleIcon,
	Minimize2Icon,
} from 'lucide-react';

import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
	MenubarSeparator,
} from '@/components/menubar';

import { useDialogStore } from '@/lib/store/dialog';

export const AppActions = () => {
	const openDialog = useDialogStore(state => state.openDialog);
	return (
		<Menubar className="rounded-none border-0 px-0 bg-transparent gap-0">
			<MenubarMenu>
				<MenubarTrigger className="font-bold">
					<FolderOpenIcon className="mr-2 size-4" />
					File
				</MenubarTrigger>
				<MenubarContent>
					<MenubarSub>
						<MenubarSubTrigger>
							<PlusIcon className="mr-2 size-4" />
							New
						</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>
								<FileTextIcon className="mr-2 size-4" />
								Content Type
							</MenubarItem>
							<MenubarItem>
								<FileIcon className="mr-2 size-4" />
								File
							</MenubarItem>
							<MenubarItem>
								<FileTextIcon className="mr-2 size-4" />
								Content
							</MenubarItem>
							<MenubarItem>
								<ListIcon className="mr-2 size-4" />
								List
							</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
					<MenubarSeparator />
					<MenubarItem onSelect={() => openDialog('import-dataset')}>
						<DatabaseIcon className="mr-2 size-4" />
						Import Dataset
					</MenubarItem>
					<MenubarItem>
						<ScanLineIcon className="mr-2 size-4" />
						Folder Scans
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>
					<WrenchIcon className="mr-2 size-4" />
					Tools
				</MenubarTrigger>
				<MenubarContent>
					<MenubarItem
						onSelect={() => console.log('file-name-replacer')}
					>
						<TypeIcon className="mr-2 size-4" />
						File Name Replacer
					</MenubarItem>
					<MenubarItem onSelect={() => console.log('finder')}>
						<SearchIcon className="mr-2 size-4" />
						Finder
					</MenubarItem>
					<MenubarItem onSelect={() => console.log('keychain')}>
						<KeyIcon className="mr-2 size-4" />
						Keychain
					</MenubarItem>
					<MenubarSeparator />
					<MenubarSub>
						<MenubarSubTrigger>
							<FilmIcon className="mr-2 size-4" />
							Video
						</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem
								onSelect={() => console.log('video-converter')}
							>
								<RefreshCwIcon className="mr-2 size-4" />
								Converter
							</MenubarItem>
							<MenubarItem
								onSelect={() =>
									console.log('video-interpolation')
								}
							>
								<Wand2Icon className="mr-2 size-4" />
								Interpolation
							</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
					<MenubarSub>
						<MenubarSubTrigger>
							<ImageIcon className="mr-2 size-4" />
							Image
						</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem
								onSelect={() => console.log('image-converter')}
							>
								<RefreshCwIcon className="mr-2 size-4" />
								Converter
							</MenubarItem>
							<MenubarItem
								onSelect={() => console.log('image-compressor')}
							>
								<FileArchiveIcon className="mr-2 size-4" />
								Optimizer
							</MenubarItem>
							<MenubarItem
								onSelect={() => console.log('image-resizer')}
							>
								<Minimize2Icon className="mr-2 size-4" />
								Resizer
							</MenubarItem>
							<MenubarItem
								onSelect={() => console.log('image-upscaler')}
							>
								<ImageUpscaleIcon className="mr-2 size-4" />
								Upscaler
							</MenubarItem>
							<MenubarItem
								onSelect={() => console.log('image-cropper')}
							>
								<CropIcon className="mr-2 size-4" />
								Cropper
							</MenubarItem>
							<MenubarItem
								onSelect={() => console.log('icon-generator')}
							>
								<ImagePlusIcon className="mr-2 size-4" />
								Icon Generator
							</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>
					<PlugIcon className="mr-2 size-4" />
					Plugins
				</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						<PlusIcon className="mr-2 size-4" />
						Add Plugin
					</MenubarItem>
					<MenubarItem>
						<SettingsIcon className="mr-2 size-4" />
						Plugin Manager
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>
					<InfoIcon className="mr-2 size-4" />
					About
				</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						<RefreshCcwIcon className="mr-2 size-4" />
						Check for updates
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						<ScrollTextIcon className="mr-2 size-4" />
						License
					</MenubarItem>
					<MenubarItem>
						<ScaleIcon className="mr-2 size-4" />
						Credits
					</MenubarItem>
					<MenubarItem>
						<InfoIcon className="mr-2 size-4" />
						About
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
};
