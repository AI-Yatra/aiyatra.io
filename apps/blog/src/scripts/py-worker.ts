// Runs reader-initiated Python away from the page, so a long loop can't freeze it
// and the page can stop it. Published code has been through PR review.
const VERSION = '0.29.5';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;

self.onmessage = async ({ data }) => {
	try {
		const { loadPyodide } = await import(/* @vite-ignore */ `${BASE}pyodide.mjs`);
		const py = await loadPyodide({ indexURL: BASE });
		await py.loadPackagesFromImports(data.code);
		const out = (text: string) => postMessage({ type: 'out', text });
		py.setStdout({ batched: out });
		py.setStderr({ batched: out });
		postMessage({ type: 'started' });
		await py.runPythonAsync(data.code);
		postMessage({ type: 'done' });
	} catch (err: any) {
		postMessage({ type: 'error', text: String(err?.message || err) });
	}
};
