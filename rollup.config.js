import tscc from '@tscc/rollup-plugin-tscc';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import compiler from 'rollup-plugin-closure-compiler';
//import typescript from '@rollup/plugin-typescript';
import nodeGlobals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import replace from '@rollup/plugin-replace';

export default {
	// input: "TestProject/main.ts",
	// output: {
	// 	//file: "bundle.js",
	// 	format: "cjs",
	// 	dir: ".",
	// },
    plugins: [
		// replace({
		// 	exclude: "node_modules/**",
		// 	replaces: {
		// 		'import \* as UUID from "uuid/v4";': 'import UUID from "uuid/v4";',
		// 		'import \* as filenamify from "filenamify";': 'import filenamify from "filenamify";',
		// 	}
		// }),
		nodeGlobals(),
		builtins(),
//		tscc(),
        resolve({
			module: true,
			main: true,
			browser: true,
		}),
//		typescript(),
		commonjs({
			include: 'node_modules/**'
		}),
		sourcemaps(),
		compiler({
			language_in: "ECMASCRIPT_2015",
			module_resolution: "NODE",
			process_common_js_modules: true
		}),
    ]
}





