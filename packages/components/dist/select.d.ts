import * as SelectPrimitive from "@radix-ui/react-select";
import type * as React from "react";
declare let SelectRoot: typeof SelectPrimitive.Root;
declare let SelectGroup: typeof SelectPrimitive.Group;
declare let SelectValue: typeof SelectPrimitive.Value;
declare function SelectTrigger({ className, children, ref,...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>): React.ReactNode;
declare function SelectScrollUpButton({ className, ref,...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>): React.ReactNode;
declare function SelectScrollDownButton({ className, ref,...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>): React.ReactNode;
declare function SelectContent({ className, children, position, ref,...props }: React.ComponentProps<typeof SelectPrimitive.Content>): React.ReactNode;
declare function SelectLabel({ className, ref,...props }: React.ComponentProps<typeof SelectPrimitive.Label>): React.ReactNode;
declare function SelectItem({ className, children, ref,...props }: React.ComponentProps<typeof SelectPrimitive.Item>): React.ReactNode;
declare function SelectSeparator({ className, ref,...props }: React.ComponentProps<typeof SelectPrimitive.Separator>): React.ReactNode;
export declare function Select({ options, label, required, error, placeholder,...props }: {
	options: Array<{
		value: string;
		label: string;
	}>;
	label: string;
	required: boolean;
	error?: string;
	placeholder: string;
} & React.ComponentProps<typeof SelectPrimitive.Root>): React.ReactNode;
export { SelectRoot, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
