import type * as React from "react";
export interface BaseTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	ref?: React.Ref<HTMLTextAreaElement>;
}
export declare function BaseTextarea({ className, ref,...props }: BaseTextareaProps): React.ReactNode;
export interface TextareaProps extends BaseTextareaProps {
	label: string;
	required?: boolean;
	error?: string;
}
export declare function Textarea({ label, required, error,...props }: TextareaProps): React.ReactNode;
