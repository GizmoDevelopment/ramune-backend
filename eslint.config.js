// Modules
import globals from "globals";
import { configs } from "@gizmo-dev/eslint-plugin";
import tslint from "typescript-eslint";

export default tslint.config(
	...configs.ts,
	{
		languageOptions: {
			ecmaVersion: 2022,
			globals: {
				...globals.node
			},
			parserOptions: {
				project: "tsconfig.json"
			}
		}
	}
);
