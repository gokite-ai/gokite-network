import { useId } from "react";
import { cn } from "@local/utils/cn";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function BaseTextarea({ className, ref,...props }) {
	return _jsx("textarea", {
		className: cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
}
export function Textarea({ label, required, error,...props }) {
	let id = useId();
	return _jsxs("div", { children: [
		_jsxs("label", {
			className: "mb-2 flex flex-col",
			htmlFor: id,
			children: [label, required ? "*" : ""]
		}),
		_jsx(BaseTextarea, {
			id,
			required,
			...props
		}),
		error && _jsx("p", {
			className: "text-sm text-red-500",
			children: error
		})
	] });
}
