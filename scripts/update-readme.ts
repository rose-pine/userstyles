#!/usr/bin/env -S deno --allow-read --allow-write

type Style = {
	name: string;
	author: string;
	category: string;
	dir: string;
};

async function readStyles(): Promise<Map<string, Style[]>> {
	const groups = new Map<string, Style[]>();

	for await (const entry of Deno.readDir("./styles")) {
		if (!entry.isDirectory) continue;
		try {
			const text = await Deno.readTextFile(
				`./styles/${entry.name}/style.json`,
			);
			const style = JSON.parse(text) as Style;
			style.dir = entry.name;
			const list = groups.get(style.category) ?? [];
			list.push(style);
			groups.set(style.category, list);
		} catch {
			console.error(`skipping ${entry.name}: missing or invalid style.json`);
		}
	}

	for (const [, styles] of groups) {
		styles.sort((a, b) => a.name.localeCompare(b.name));
	}

	return groups;
}

function generateList(groups: Map<string, Style[]>): string {
	const sortedCategories = [...groups.keys()].sort((a, b) =>
		a.toLowerCase().localeCompare(b.toLowerCase())
	);

	const lines: string[] = ["## Userstyles", ""];

	for (const category of sortedCategories) {
		const styles = groups.get(category)!;
		lines.push(`**${category}**`);
		lines.push("");
		for (const style of styles) {
			lines.push(
				`- [${style.name}](https://github.com/rose-pine/userstyles/tree/main/styles/${style.dir})`,
			);
		}
		lines.push("");
	}

	return lines.join("\n");
}

const groups = await readStyles();
const list = generateList(groups);

const readme = await Deno.readTextFile("./README.md");
const start = readme.indexOf("## Userstyles");
const end = readme.indexOf("## Contributing");

if (start === -1 || end === -1) {
	console.error(
		"Could not find ## Userstyles or ## Contributing markers in README.md",
	);
	Deno.exit(1);
}

const newReadme = readme.slice(0, start) + list + "\n\n" + readme.slice(end);
await Deno.writeTextFile("./README.md", newReadme);

console.log("README.md updated successfully");
