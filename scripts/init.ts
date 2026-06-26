#!/usr/bin/env -S deno --allow-read --allow-write
// vim:ft=typescript

function replace(
	source: string,
	identifier: string,
	replacement: string,
): string {
	const pattern = new RegExp(`\{\{\s*${identifier}\s*\}\}`, "g");
	return source.replace(pattern, replacement);
}

function replaceMap(
	source: string,
	substitutions: Record<string, string>,
): string {
	let buff = source;
	for (const [key, value] of Object.entries(substitutions)) {
		buff = replace(buff, key, value);
	}
	return buff;
}

const substitutions = {
	title: Deno.args[0],
	directory: Deno.args[0].toLowerCase().replaceAll(" ", "-"),
	year: new Date().getUTCFullYear(),
};

const themePath = `./styles/${substitutions.directory}`;
await Deno.mkdir(themePath);

const userstyleTemplate = await Deno.readTextFile(
	"./template/rose-pine.user.less",
);
const readmeTemplate = await Deno.readTextFile("./template/readme.md");
const licenseTemplate = await Deno.readTextFile("./template/license");

const styleJson = {
	name: substitutions.title,
	author: "",
	category: "",
};

await Deno.writeTextFile(
	`${themePath}/rose-pine.user.less`,
	replaceMap(userstyleTemplate, substitutions),
);
await Deno.writeTextFile(
	`${themePath}/README.md`,
	replaceMap(readmeTemplate, substitutions),
);
await Deno.writeTextFile(
	`${themePath}/LICENSE`,
	replaceMap(licenseTemplate, substitutions),
);
await Deno.writeTextFile(
	`${themePath}/style.json`,
	JSON.stringify(styleJson, null, 2) + "\n",
);
