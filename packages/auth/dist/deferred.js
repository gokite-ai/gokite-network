"use client";
export class Deferred {
	_promise;
	_resolve;
	_reject;
	fullfilled = false;
	constructor() {
		this._promise = new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});
	}
	get promise() {
		return this._promise;
	}
	resolve = (value) => {
		this.fullfilled = true;
		this._resolve(value);
	};
	reject = (reason) => {
		this._reject(reason);
	};
}
