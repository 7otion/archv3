import { Database } from 'bun:sqlite';
import chalk from 'chalk';
import { faker } from '@faker-js/faker';

export function categorySeeder(db: Database) {
	const contentTypes = db.query('SELECT id, name FROM content_types').all();
	const insert = db.query(`
		INSERT INTO categories (content_type_id, name, slug, description, cover, cover_gif)
		VALUES ($content_type_id, $name, $slug, $description, $cover, $cover_gif)
	`);

	let lastLogLength = 0;
	for (const ctRaw of contentTypes) {
		const ct = ctRaw as { id: number; name: string };
		for (let i = 0; i < 10; i++) {
			const name = faker.commerce.department() + ' ' + faker.word.noun();
			const slug = name
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^a-z0-9-]/g, '');
			const description = faker.lorem.sentence();
			const cover = null;
			const cover_gif = null;
			insert.run({
				$content_type_id: ct.id,
				$name: name,
				$slug: slug + '-' + faker.string.alphanumeric(6).toLowerCase(),
				$description: description,
				$cover: cover,
				$cover_gif: cover_gif,
			});
			const logMsg = chalk.green(
				`Seeded category for ${ct.name}: ${name}`,
			);
			process.stdout.write(logMsg + '\r');
			lastLogLength = logMsg.length;
		}
	}

	process.stdout.write(' '.repeat(lastLogLength) + '\r');
	console.log(chalk.blue('Categories seeding complete.'));
}
