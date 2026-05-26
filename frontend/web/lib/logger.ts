const isDev = process.env.NODE_ENV === "development";

export const logger = {
	debug: isDev ? console.debug.bind(console) : () => {},
	warn: isDev ? console.warn.bind(console) : console.warn.bind(console),
	error: console.error.bind(console),
};
