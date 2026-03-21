const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

// Copy sql-wasm.wasm to dist/ if not already there
const wasmSrc = path.join(__dirname, "node_modules", "sql.js", "dist", "sql-wasm.wasm");
const wasmDst = path.join(__dirname, "dist", "sql-wasm.wasm");
if (fs.existsSync(wasmSrc) && !fs.existsSync(wasmDst)) {
	fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
	fs.copyFileSync(wasmSrc, wasmDst);
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	// Extension build (Node, CJS)
	const extCtx = await esbuild.context({
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
		loader: { '.css': 'text' },
	});

	// Webview build (browser, IIFE)
	const webCtx = await esbuild.context({
		entryPoints: ['src/webview/webview.ts'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'dist/webview.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	if (watch) {
		await Promise.all([extCtx.watch(), webCtx.watch()]);
	} else {
		await Promise.all([extCtx.rebuild(), webCtx.rebuild()]);
		await Promise.all([extCtx.dispose(), webCtx.dispose()]);
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
