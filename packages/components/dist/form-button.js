"use client";
import { cn } from "@local/utils/cn";
import { useFormStatus } from "react-dom";
import { Action } from "./action";
import { jsx as _jsx } from "react/jsx-runtime";
export function FormButton(props) {
	let status = useFormStatus();
	return _jsx(Action, {
		...props,
		type: "submit",
		is: "button",
		className: cn(props.className, status.pending && "loading"),
		disabled: status.pending
	});
}
