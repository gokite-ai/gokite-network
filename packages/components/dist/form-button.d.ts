import type { ActionProps } from "./action";
type FormButtonProps = Omit<ActionProps, "type" | "is">;
export declare function FormButton(props: FormButtonProps): React.ReactNode;
export {};
