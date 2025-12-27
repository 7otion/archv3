import { Database } from 'bun:sqlite';
import chalk from 'chalk';

export function contentTypeSeeder(db: Database) {
	const contentTypes = [
		{
			name: 'Movies',
			shape: 'rectangular',
			file_type: 'video',
			description: 'All your movies and films',
			cover: null,
			icon: 'film',
			order: 0,
			pinned: 1,
			docked: 0,
			locked: 0,
		},
		{
			name: 'Games',
			shape: 'square',
			file_type: 'other',
			description: 'PC, console, and mobile games',
			cover: null,
			icon: 'gamepad',
			order: 1,
			pinned: 0,
			docked: 0,
			locked: 0,
		},
		{
			name: 'Work Files',
			shape: 'rectangular',
			file_type: 'document',
			description: 'Documents and work-related files',
			cover: null,
			icon: 'briefcase',
			order: 2,
			pinned: 0,
			docked: 0,
			locked: 0,
		},
		{
			name: 'Family Photos',
			shape: 'square',
			file_type: 'image',
			description: 'Personal and family images',
			cover: null,
			icon: 'image',
			order: 3,
			pinned: 0,
			docked: 0,
			locked: 0,
		},
	];

	const insert = db.query(`
		INSERT INTO content_types
			(name, slug, shape, file_type, description, cover, icon, "order", pinned, docked, locked)
		VALUES
			($name, $slug, $shape, $file_type, $description, $cover, $icon, $order, $pinned, $docked, $locked)
	`);

	let lastLogLength = 0;
	for (const props of contentTypes) {
		insert.run({
			$name: props.name,
			$slug: props.name.toLowerCase().replace(/\s+/g, '-'),
			$shape: props.shape,
			$file_type: props.file_type,
			$description: props.description,
			$cover: props.cover,
			$icon: props.icon,
			$order: props.order,
			$pinned: props.pinned,
			$docked: props.docked,
			$locked: props.locked,
		});
		const logMsg = chalk.green(`Seeded content type: ${props.name}`);
		process.stdout.write(logMsg + '\r');
		lastLogLength = logMsg.length;
	}

	process.stdout.write(' '.repeat(lastLogLength) + '\r');
	console.log(chalk.blue('Content types seeding complete.'));
}
