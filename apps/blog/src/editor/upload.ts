// Saves a dropped, pasted or picked file into the draft. Decap holds it in
// memory and commits it with the post, so it lands in the same PR.
import { toast } from './dom';

export const PUBLIC_FOLDER = '/blog/images/uploads';
const MAX_MB = 10;
const MAX_IMAGE_EDGE = 2000;

export type FileKind = 'image' | 'video' | 'audio' | 'file';

export function kindOf(file: File): FileKind {
	const type = file.type.split('/')[0];
	return type === 'image' || type === 'video' || type === 'audio' ? type : 'file';
}

/** In-memory copies of this session's uploads, by saved path. */
const local = new Map<string, string>();

function slugName(name: string, ext?: string) {
	const dot = name.lastIndexOf('.');
	const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'file';
	const suffix = Math.random().toString(36).slice(2, 7);
	return `${base}-${suffix}.${ext || (dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin')}`;
}

/** Photos are resized and converted to WebP, so one post doesn't weigh down the repo or the page. */
async function optimise(file: File): Promise<File> {
	if (!/^image\/(png|jpeg|webp|avif|bmp)$/.test(file.type)) return new File([file], slugName(file.name), { type: file.type });
	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(bitmap.width * scale);
		canvas.height = Math.round(bitmap.height * scale);
		canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		bitmap.close();
		const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/webp', 0.85));
		if (blob && blob.type === 'image/webp' && blob.size < file.size) return new File([blob], slugName(file.name, 'webp'), { type: 'image/webp' });
	} catch { /* an image the browser can't decode is uploaded as it is */ }
	return new File([file], slugName(file.name), { type: file.type });
}

/** Returns the path the post should reference, or null if the file was refused. */
export async function uploadFile(file: File, props: any): Promise<string | null> {
	const ready = await optimise(file);
	if (ready.size > MAX_MB * 1024 * 1024) {
		toast(`“${file.name}” is ${(ready.size / 1048576).toFixed(1)} MB. The limit is ${MAX_MB} MB, so host large videos on YouTube and paste the link.`, 'error');
		return null;
	}
	const path = `${PUBLIC_FOLDER}/${ready.name}`;
	local.set(path, URL.createObjectURL(ready));
	await props.onPersistMedia(ready, { field: props.field });
	return path;
}

/** A URL for showing a saved path in the editor, including files not yet on the site. */
export function resolveAsset(props: () => any, path: string, done: (url: string) => void) {
	if (!path) return;
	if (local.has(path)) return done(local.get(path)!);
	if (/^(https?:|data:|blob:)/.test(path)) return done(path);
	let tries = 0;
	const attempt = () => {
		const { getAsset, field } = props();
		const asset = getAsset?.(path, field);
		if (asset && asset.path !== 'empty.svg') return done(String(asset));
		if (++tries < 25) setTimeout(attempt, 300); else done(path);
	};
	attempt();
}
