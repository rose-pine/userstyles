npx prettier@latest --parser=less --write ./styles/**/*.css
npx prettier@latest --write ./**/*.md

cd ./scripts && npm install && cd ..
node ./scripts/generate-imports.js
