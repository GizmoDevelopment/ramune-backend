// Modules
import globals from "globals";
import { configs } from "@gizmo-dev/eslint-plugin";

export default [
	...configs.ts,
	{
		languageOptions: {
			ecmaVersion: 2022,
			globals: {
				...globals.node
			},
			parserOptions: {
				project: true
			}
		}
	}
];
