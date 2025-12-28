import { ClockIcon, FileIcon } from 'lucide-react';

import type { Content } from '@/lib/models/content';
import { formatPastDate } from '@/lib/utils';

export const ContentGenericCard = ({
	content,
	onClick,
}: {
	content: Content;
	onClick?: () => void;
}) => {
	return (
		<div
			className="group/card relative min-h-50 bg-zinc-900/80 border border-zinc-700/50 rounded-md hover:border-zinc-500/50 cursor-pointer overflow-hidden flex flex-col"
			onClick={onClick}
		>
			<div className="relative z-10 p-3 pb-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-linear-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0">
							{content.rating}
						</div>
						<div>
							<h3 className="text-white font-medium text-sm leading-tight text-shadow-strong">
								{content.name}
							</h3>
							<p className="text-orange-200 text-xs">qweqweqwe</p>
						</div>
					</div>
				</div>
			</div>

			<div className="p-3 flex-1 flex flex-col">
				<p className="text-zinc-400 text-xs mb-3 line-clamp-3 leading-relaxed flex-1">
					{content.description}
				</p>

				<div className="mt-auto">
					<div className="space-y-2 text-xs">
						<div className="flex justify-between items-center">
							<span className="text-zinc-500">Views:</span>
							<span className="text-zinc-300 font-mono">
								{content.view_count}
							</span>
						</div>

						{content.last_viewed_at && (
							<div className="flex items-center justify-between">
								<span className="text-zinc-500 flex items-center gap-1">
									<ClockIcon className="w-3 h-3" />
									Last viewed:
								</span>
								<span className="text-zinc-300 font-mono text-xs">
									{formatPastDate(content.lastViewedAtDate)}
								</span>
							</div>
						)}
					</div>

					{content.file && (
						<div className="mt-4 pt-3 border-t border-zinc-700/50">
							<div className="flex items-center gap-2 mb-2">
								<FileIcon className="w-3 h-3 text-zinc-400" />
								<span className="text-xs text-zinc-500">
									File Information
								</span>
							</div>

							<div className="space-y-1 text-xs">
								<div className="flex justify-between items-center">
									<span className="text-zinc-500 truncate mr-2">
										{content.file.name}
									</span>
									<span className="text-green-400 font-mono">
										{content.file.sizeFormatted}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-zinc-500">
										Created:
									</span>
									<span className="text-zinc-400 font-mono">
										{formatPastDate(
											content.file.fileCreatedDate,
										)}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
