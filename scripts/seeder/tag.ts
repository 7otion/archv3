import { Database } from 'bun:sqlite';
import chalk from 'chalk';
import { faker } from '@faker-js/faker';

export function tagSeeder(db: Database) {
	const contentTypes = db.query('SELECT id, name FROM content_types').all();
	const insertTag = db.query(`
		INSERT INTO tags (content_type_id, name, slug, description)
		VALUES ($content_type_id, $name, $slug, $description)
	`);
	const getContents = db.query(
		'SELECT id FROM contents WHERE content_type_id = $ctid',
	);
	const getTags = db.query(
		'SELECT id FROM tags WHERE content_type_id = $ctid',
	);
	const insertContentTag = db.query(`
		INSERT INTO content_tags (content_id, tag_id)
		VALUES ($content_id, $tag_id)
	`);

	let lastLogLength = 0;
	for (const ctRaw of contentTypes) {
		process.stdout.write(' '.repeat(lastLogLength) + '\r');
		lastLogLength = 0;
		const ct = ctRaw as { id: number; name: string };
		const tagNames = new Set<string>();
		for (let i = 0; i < 10; i++) {
			let name: string;
			do {
				name =
					faker.commerce.productAdjective() + ' ' + faker.word.noun();
			} while (tagNames.has(name));
			tagNames.add(name);
			const slug =
				name
					.toLowerCase()
					.replace(/\s+/g, '-')
					.replace(/[^a-z0-9-]/g, '') +
				'-' +
				faker.string.alphanumeric(6).toLowerCase();
			const description = faker.lorem.sentence();
			insertTag.run({
				$content_type_id: ct.id,
				$name: name,
				$slug: slug,
				$description: description,
			});
		}
		const contents = getContents.all({ $ctid: ct.id }) as { id: number }[];
		const tags = getTags.all({ $ctid: ct.id }) as { id: number }[];
		db.run('BEGIN TRANSACTION');
		for (let i = 0; i < contents.length; i++) {
			const contentId = contents[i].id;
			const numTags = faker.number.int({ min: 0, max: tags.length });
			const shuffled = faker.helpers.shuffle(tags);
			for (let j = 0; j < numTags; j++) {
				insertContentTag.run({
					$content_id: contentId,
					$tag_id: shuffled[j].id,
				});
			}
			if ((i + 1) % 500 === 0 || i === contents.length - 1) {
				const logMsg = chalk.green(
					`Seeded tags for ${ct.name}: ${i + 1}/${contents.length}`,
				);
				process.stdout.write(logMsg + '\r');
				lastLogLength = logMsg.length;
			}
		}
		db.run('COMMIT');
	}

	process.stdout.write(' '.repeat(lastLogLength) + '\r');
	console.log(chalk.blue('Tag seeding complete.'));
}
