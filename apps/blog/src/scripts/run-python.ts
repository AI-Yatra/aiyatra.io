// A Run button on Python samples, using Pyodide (Python compiled for the browser).
// Run only appears when every import can actually load there, so readers never
// click it just to hit an error about torch or a private package.
const RUNNABLE = new Set(['abc', 'array', 'base64', 'bisect', 'collections', 'copy', 'csv', 'dataclasses', 'datetime', 'decimal', 'enum', 'fractions', 'functools', 'hashlib', 'heapq', 'html', 'io', 'itertools', 'json', 'math', 'operator', 'pprint', 'random', 're', 'secrets', 'statistics', 'string', 'textwrap', 'time', 'typing', 'unicodedata', 'uuid', 'numpy', 'pandas', 'scipy', 'sympy', 'sklearn']);
const TIMEOUT_MS = 90_000;

function canRun(code: string) {
	if (/^\s*[!%]/m.test(code) || /\binput\s*\(/.test(code)) return false; // shell lines and prompts can't work here
	const imports = [...code.matchAll(/^\s*(?:from|import)\s+([\w]+)/gm)].map((m) => m[1]);
	return imports.every((name) => RUNNABLE.has(name));
}

function attach(pre: HTMLElement, wrap: HTMLElement) {
	if (pre.dataset.language !== 'python') return;
	const code = pre.textContent || '';
	if (!code.trim() || !canRun(code)) return;
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'code-run';
	button.textContent = '▶ Run';
	const output = document.createElement('pre');
	output.className = 'code-output';
	output.setAttribute('aria-live', 'polite');
	output.hidden = true;
	button.addEventListener('click', () => {
		button.disabled = true;
		button.textContent = 'Running…';
		output.hidden = false;
		output.classList.remove('is-error');
		output.textContent = 'Loading Python in your browser. The first run downloads about 10 MB…';
		const worker = new Worker(new URL('./py-worker.ts', import.meta.url), { type: 'module' });
		let text = '';
		const finish = () => {
			clearTimeout(timer);
			worker.terminate();
			button.disabled = false;
			button.textContent = '▶ Run again';
		};
		const fail = (message: string) => { output.classList.add('is-error'); output.textContent = `${text}${message}`; finish(); };
		const timer = window.setTimeout(() => fail(`Stopped: this took longer than ${TIMEOUT_MS / 1000} seconds.`), TIMEOUT_MS);
		worker.onmessage = ({ data }) => {
			if (data.type === 'started') output.textContent = '';
			if (data.type === 'out') { text += `${data.text}\n`; output.textContent = text; }
			if (data.type === 'done') { if (!text) output.textContent = 'Finished. This code printed nothing.'; finish(); }
			if (data.type === 'error') fail(data.text);
		};
		worker.onerror = () => fail('Python couldn’t start in this browser.');
		worker.postMessage({ code });
	});
	wrap.append(button);
	wrap.after(output);
}

document.querySelectorAll<HTMLElement>('.blog-body .code-wrap').forEach((wrap) => {
	const pre = wrap.querySelector<HTMLElement>('pre');
	if (pre) attach(pre, wrap);
});
document.addEventListener('ay-code-block', (e) => {
	const { pre, wrap } = (e as CustomEvent).detail;
	attach(pre, wrap);
});
