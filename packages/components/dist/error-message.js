import { jsx as _jsx } from "react/jsx-runtime";
export function ErrorMessage({ children }) {
	return _jsx("p", {
		className: "p-4 rounded border-solid border-2 border-red-500 text-red-500 bg-red-50",
		children
	});
}
