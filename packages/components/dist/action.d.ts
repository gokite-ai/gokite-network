import NextLink from "next/link";
import type { ReactNode } from "react";
export type ActionProps = {
	children: ReactNode;
	is: "button" | "a" | typeof NextLink;
	href?: string;
	disabled?: boolean;
	className?: string;
	variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "text";
	size?: "sm" | "md" | "lg";
	type?: "button" | "submit" | "reset";
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
};
export declare function Action({ is, disabled, href, className, variant, size,...props }: ActionProps): React.ReactNode;
