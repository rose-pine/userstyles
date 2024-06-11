import * as fs from "fs";
import usercssMeta from "usercss-meta";

const settings = {
	updateInterval: 24,
	updateOnlyEnabled: true,
	patchCsp: true,
};

const result = [];
const ignored = [];

console.log("Generating import list...");

const themes = fs.readdirSync("./styles");
for (const theme of themes) {
	const data = fs.readFileSync(`./styles/${theme}/rose-pine.user.css`);
	const metaDataRegex = /\/\*\s*==UserStyle==.*==\/UserStyle==\s*\*\//is;
	const metaData = metaDataRegex.exec(data.toString());

	if (!metaData) {
		ignored.push(theme);
		continue;
	}

	const usercssData = usercssMeta.parse(metaData[0]).metadata;
	result.push({
		enabled: true,
		name: usercssData.name ?? "",
		description: usercssData.description ?? "",
		author: "Rose Piné",
		updateUrl: usercssData.updateURL ?? "",
		usercssData,
		sourceCode: data.toString(),
	});
}

fs.writeFileSync(
	"import.json",
	JSON.stringify(
		[
			{
				settings,
			},
			...result,
		],
		null,
		2,
	),
);

if (ignored.length) {
	console.log(
		"The following themes were ignored because they are missing UserCSS metadata:",
		ignored.join(", "),
	);
}
