"use client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Action } from "./action";
import { jsx as _jsx } from "react/jsx-runtime";
export function Link({ variant: providedVariant, size: providedSize,...props }) {
	let variant = providedVariant || "text";
	let size = providedSize || "md";
	return _jsx(Action, {
		...props,
		is: NextLink,
		variant,
		size
	});
}
export function ActiveLink({ href,...props }) {
	let pathname = usePathname();
	let isActive = pathname === href;
	if (isActive) {
		return _jsx("span", { ...props });
	}
	return _jsx(Link, {
		href,
		...props
	});
}
