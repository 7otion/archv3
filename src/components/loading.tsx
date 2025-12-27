import { Spinner } from '@/components/spinner';

export function Loading({ message }: { message?: string }) {
	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
			<Spinner className="mb-6 size-12 text-muted-foreground" />
			{message && (
				<span className="text-lg font-medium text-muted-foreground animate-pulse">
					{message}
				</span>
			)}
		</div>
	);
}
