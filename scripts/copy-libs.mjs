import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// Keep the original library builds deployed beside the ES6 entry point.
const libraries = ['bga-animations', 'bga-cards'];
mkdirSync('modules/js', { recursive: true });
for (const library of libraries) {
    const source = `node_modules/${library}/${library}.js`;
    const destination = `modules/js/${library}.js`;
    if (library === 'bga-animations') {
        // This original version leaves AnimationManager global; expose that
        // same constructor through its AMD export for the ES6 loader.
        const code = readFileSync(source, 'utf8');
        writeFileSync(destination, code.replace('define({', 'define({\n    AnimationManager: AnimationManager,'));
    } else {
        copyFileSync(source, destination);
    }
}

// The original .d.ts files duplicate loader globals. Keep their API declarations
// in one namespace so they can be typed alongside the modern framework helper.
const declarations = ['bga-cards'].map(library =>
    readFileSync(`node_modules/${library}/${library}.d.ts`, 'utf8')
        .replace(/^declare const define:.*$/gm, '')
        .replace(/^declare /gm, '')
).join('\n');
writeFileSync('legacy-bga-libs.d.ts',
    '// Generated from the original library declarations by scripts/copy-libs.mjs.\n' +
    'declare namespace LegacyBga {\n    type Game = GameGui;\n' + declarations + '\n}\n');
