import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground hover:bg-primary/90',
				success: 'bg-green-700 text-white shadow hover:bg-green-600',
				info: 'bg-blue-700 text-white shadow hover:bg-blue-600',
				destructive:
					'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
				'default-outline':
					'border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground',
				'success-outline':
					'border border-green-500 text-green-500 hover:border-green-600 hover:bg-green-600 hover:text-foreground',
				'info-outline':
					'border border-blue-500 text-blue-500 hover:border-blue-600 hover:bg-blue-600 hover:text-foreground',
				'destructive-outline':
					'border border-red-500 text-red-500 hover:border-red-600 hover:bg-red-600 hover:text-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-9',
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export const badgeVariants = cva(
	'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
				success:
					'border-transparent bg-green-700 text-white shadow [a&]:hover:bg-green-600',
				info: 'border-transparent bg-blue-700 text-white shadow [a&]:hover:bg-blue-600',
				warning:
					'border-transparent bg-yellow-500 text-black shadow [a&]:hover:bg-yellow-400',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
				destructive:
					'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
				'default-outline':
					'border border-input bg-background text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
				'success-outline':
					'border border-green-500 text-green-500 [a&]:hover:border-green-600 [a&]:hover:bg-green-600 [a&]:hover:text-white',
				'info-outline':
					'border border-blue-500 text-blue-500 [a&]:hover:border-blue-600 [a&]:hover:bg-blue-600 [a&]:hover:text-white',
				'destructive-outline':
					'border border-red-500 text-red-500 [a&]:hover:border-red-600 [a&]:hover:bg-red-600 [a&]:hover:text-white',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export const toggleVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
	{
		variants: {
			variant: {
				default: 'bg-transparent',
				outline:
					'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
			},
			size: {
				default: 'h-9 px-2 min-w-9',
				sm: 'h-8 px-1.5 min-w-8',
				lg: 'h-10 px-2.5 min-w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);
