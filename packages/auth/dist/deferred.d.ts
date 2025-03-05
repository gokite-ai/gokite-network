export declare class Deferred<T> {
	private readonly _promise;
	private _resolve;
	private _reject;
	fullfilled: boolean;
	constructor();
	get promise(): Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: any) => void;
}
