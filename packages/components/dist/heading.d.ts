import type { ReactNode } from "react";
type Props = {
	level: 1 | 2 | 3 | 4 | 5 | 6;
	className?: string;
	children: ReactNode;
};
export declare function Heading({ level, className,...rest }: Props): React.ReactNode;
export {};
