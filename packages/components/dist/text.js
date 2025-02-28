import { cn } from "@local/utils/cn";
import { jsx as _jsx } from "react/jsx-runtime";
export function Text({ className,...rest }) {
	return _jsx("p", {
		...rest,
		className: cn("text-base text-gray-700 dark:text-gray-300", className)
	});
}
