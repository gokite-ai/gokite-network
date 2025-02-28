import type * as React from "react";
export interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	ref?: React.Ref<HTMLInputElement>;
}
export declare function BaseInput({ className, type, ref,...props }: BaseInputProps): React.ReactNode;
export interface InputProps extends BaseInputProps {
	label: string;
	required?: boolean;
	error?: string;
}
export declare function Input({ label, required, error,...props }: InputProps): React.ReactNode;
