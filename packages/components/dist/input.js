"use client";
import { useId } from "react";
import { cn } from "@local/utils/cn";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function BaseInput({ className, type, ref,...props }) {
	return _jsx("input", {
		type,
		className: cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
}
export function Input({ label, required, error,...props }) {
	let id = useId();
	return _jsxs("div", { children: [
		_jsxs("label", {
			className: "mb-2 flex flex-col",
			htmlFor: id,
			children: [label, required ? "*" : ""]
		}),
		_jsx(BaseInput, {
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
