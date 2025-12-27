import { useState, useEffect } from 'react';
import {
	CheckIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsUpDownIcon,
} from 'lucide-react';

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';
import { Button } from '@/components/button';

import { searchIcons, getIconSVG } from '@/lib/services/iconify';
import { cn } from '@/lib/utils';

import { IconPreview } from './preview';

interface IconPickerProps {
	value?: string;
	onChange?: (svgString: string) => void;
	className?: string;
	iconSet?: string;
}

function IconPicker({
	value,
	onChange,
	className,
	iconSet = 'lucide',
}: IconPickerProps) {
	const [open, setOpen] = useState(false);
	const [selectedIconName, setSelectedIconName] = useState<string | null>(
		null,
	);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(0);
	const [icons, setIcons] = useState<string[]>([]);
	const [totalIcons, setTotalIcons] = useState(0);
	const [loading, setLoading] = useState(false);

	const ICONS_PER_PAGE = 24;

	useEffect(() => {
		if (!searchQuery) return;

		let mounted = true;
		async function search() {
			setLoading(true);
			try {
				const results = await searchIcons(searchQuery, {
					prefix: iconSet,
					limit: ICONS_PER_PAGE,
					start: currentPage * ICONS_PER_PAGE,
				});

				if (mounted && results) {
					setIcons(results.icons);
					setTotalIcons(results.total);
				}
			} catch (error) {
				console.error('Icon search failed:', error);
			} finally {
				if (mounted) setLoading(false);
			}
		}
		search();
		return () => {
			mounted = false;
		};
	}, [searchQuery, currentPage, iconSet]);

	const totalPages = Math.ceil(totalIcons / ICONS_PER_PAGE);

	useEffect(() => {
		setCurrentPage(0);
	}, [searchQuery]);

	async function handleIconSelect(iconName: string) {
		setSelectedIconName(iconName);
		const svgString = await getIconSVG(iconSet, iconName);
		if (svgString) {
			onChange?.(svgString);
			setOpen(false);
		}
	}

	function handleNextPage() {
		if (currentPage < totalPages - 1) {
			setCurrentPage(prev => prev + 1);
		}
	}

	function handlePrevPage() {
		if (currentPage > 0) {
			setCurrentPage(prev => prev - 1);
		}
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn('size-10 p-0', className)}
					aria-label="Select icon"
				>
					{value && !selectedIconName && (
						<div
							className="size-10 flex items-center justify-center"
							dangerouslySetInnerHTML={{ __html: value }}
						/>
					)}

					{selectedIconName && (
						<IconPreview
							iconSet={iconSet}
							iconName={selectedIconName!}
							className="size-5"
						/>
					)}

					{!value && !selectedIconName && (
						<ChevronsUpDownIcon className="size-5" />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[320px] p-0 mx-4" align="start">
				<Command shouldFilter={false}>
					<div className="relative">
						<CommandInput
							placeholder="Search icons..."
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>
					</div>
					<CommandList>
						<CommandEmpty>
							{loading ? 'Searching...' : 'No icons found'}
						</CommandEmpty>
						<CommandGroup>
							<div className="grid grid-cols-6 gap-1 p-2">
								{icons.map(iconName => {
									const isSelected =
										value?.includes(iconName);
									return (
										<CommandItem
											key={iconName}
											value={iconName}
											onSelect={() =>
												handleIconSelect(iconName)
											}
											className={cn(
												'flex flex-col items-center justify-center gap-1 p-2 cursor-pointer relative',
												isSelected && 'bg-accent',
											)}
										>
											<IconPreview
												iconSet={iconSet}
												iconName={iconName}
											/>
											{isSelected && (
												<CheckIcon className="absolute top-0.5 right-0.5 h-3 w-3 text-primary" />
											)}
										</CommandItem>
									);
								})}
							</div>
						</CommandGroup>
					</CommandList>
					{totalPages > 1 && (
						<div className="flex items-center justify-between px-2 pb-2 border-t pt-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={handlePrevPage}
								disabled={currentPage === 0 || loading}
								className="h-8"
							>
								<ChevronLeftIcon className="h-4 w-4" />
							</Button>
							<span className="text-xs text-muted-foreground">
								Page {currentPage + 1} of {totalPages}
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleNextPage}
								disabled={
									currentPage >= totalPages - 1 || loading
								}
								className="h-8"
							>
								<ChevronRightIcon className="h-4 w-4" />
							</Button>
						</div>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export { IconPicker };
