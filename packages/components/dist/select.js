"use client";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@local/utils/cn";
import { useId } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
let SelectRoot = SelectPrimitive.Root;
let SelectGroup = SelectPrimitive.Group;
let SelectValue = SelectPrimitive.Value;
function SelectTrigger({ className, children, ref,...props }) {
	return _jsxs(SelectPrimitive.Trigger, {
		ref,
		className: cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
		...props,
		children: [children, _jsx(SelectPrimitive.Icon, {
			asChild: true,
			children: _jsx(ChevronDown, { className: "h-4 w-4 opacity-50" })
		})]
	});
}
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
function SelectScrollUpButton({ className, ref,...props }) {
	return _jsx(SelectPrimitive.ScrollUpButton, {
		ref,
		className: cn("flex cursor-default items-center justify-center py-1", className),
		...props,
		children: _jsx(ChevronUp, { className: "h-4 w-4" })
	});
}
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
function SelectScrollDownButton({ className, ref,...props }) {
	return _jsx(SelectPrimitive.ScrollDownButton, {
		ref,
		className: cn("flex cursor-default items-center justify-center py-1", className),
		...props,
		children: _jsx(ChevronDown, { className: "h-4 w-4" })
	});
}
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
function SelectContent({ className, children, position, ref,...props }) {
	return _jsx(SelectPrimitive.Portal, { children: _jsxs(SelectPrimitive.Content, {
		ref,
		className: cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
		position,
		...props,
		children: [
			_jsx(SelectScrollUpButton, {}),
			_jsx(SelectPrimitive.Viewport, {
				className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
				children
			}),
			_jsx(SelectScrollDownButton, {})
		]
	}) });
}
SelectContent.displayName = SelectPrimitive.Content.displayName;
function SelectLabel({ className, ref,...props }) {
	return _jsx(SelectPrimitive.Label, {
		ref,
		className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className),
		...props
	});
}
SelectLabel.displayName = SelectPrimitive.Label.displayName;
function SelectItem({ className, children, ref,...props }) {
	return _jsxs(SelectPrimitive.Item, {
		ref,
		className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
		...props,
		children: [_jsx("span", {
			className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
			children: _jsx(SelectPrimitive.ItemIndicator, { children: _jsx(Check, { className: "h-4 w-4" }) })
		}), _jsx(SelectPrimitive.ItemText, { children })]
	});
}
SelectItem.displayName = SelectPrimitive.Item.displayName;
function SelectSeparator({ className, ref,...props }) {
	return _jsx(SelectPrimitive.Separator, {
		ref,
		className: cn("-mx-1 my-1 h-px bg-muted", className),
		...props
	});
}
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
export function Select({ options, label, required, error, placeholder,...props }) {
	let id = useId();
	return _jsxs("div", { children: [
		_jsxs("label", {
			className: "mb-2 flex flex-col",
			htmlFor: id,
			children: [label, required ? "*" : ""]
		}),
		_jsxs(SelectRoot, {
			name: id,
			...props,
			children: [_jsx(SelectTrigger, {
				className: "w-[180px]",
				children: _jsx(SelectValue, { placeholder })
			}), _jsx(SelectContent, { children: options.map((option) => _jsx(SelectItem, {
				value: option.value,
				children: option.label
			}, option.value)) })]
		}),
		error && _jsx("p", {
			className: "text-sm text-red-500",
			children: error
		})
	] });
}
export { SelectRoot, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
