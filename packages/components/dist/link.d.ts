import type { ActionProps } from "./action";
export type LinkProps = Omit<ActionProps, "is"> & { href: string };
export declare function Link({ variant: providedVariant, size: providedSize,...props }: LinkProps): React.ReactNode;
export declare function ActiveLink({ href,...props }: LinkProps): React.ReactNode;
