// Tables with column alignment, saved as standard GFM (":---", ":---:", "---:").
import { Table, TableCell, TableHeader } from '@tiptap/extension-table';
import { Fragment } from '@tiptap/pm/model';
import { getHTMLFromFragment } from '@tiptap/core';
import { selectedRect } from '@tiptap/pm/tables';
import type { Editor } from '@tiptap/core';

const align = {
	align: {
		default: null,
		parseHTML: (e: HTMLElement) => e.style.textAlign || e.getAttribute('align') || null,
		renderHTML: (a: Record<string, string>) => (a.align ? { style: `text-align: ${a.align}` } : {}),
	},
};

export const PostCell = TableCell.extend({ addAttributes() { return { ...this.parent?.(), ...align }; } });
export const PostHeader = TableHeader.extend({ addAttributes() { return { ...this.parent?.(), ...align }; } });

const delimiter = (a: string | null) => (a === 'center' ? ':---:' : a === 'right' ? '---:' : a === 'left' ? ':---' : '---');

function fitsMarkdown(table: any) {
	let ok = true;
	table.forEach((row: any, _: number, r: number) => row.forEach((cell: any) => {
		if ((r === 0) !== (cell.type.name === 'tableHeader')) ok = false;
		if (cell.attrs.colspan > 1 || cell.attrs.rowspan > 1) ok = false;
		if (cell.childCount > 1 || !cell.firstChild?.isTextblock || cell.firstChild.type.name !== 'paragraph') ok = false;
	}));
	return ok;
}

export const PostTable = Table.extend({
	addStorage() {
		return {
			...this.parent?.(),
			markdown: {
				serialize(state: any, node: any) {
					if (!fitsMarkdown(node)) {
						state.write(getHTMLFromFragment(Fragment.from(node), node.type.schema));
						state.closeBlock(node);
						return;
					}
					state.inTable = true;
					node.forEach((row: any, _: number, i: number) => {
						state.write('| ');
						row.forEach((cell: any, __: number, j: number) => {
							if (j) state.write(' | ');
							if (!cell.firstChild.textContent.trim()) return;
							const start = state.out.length;
							state.renderInline(cell.firstChild);
							// A literal pipe would otherwise end the cell.
							state.out = state.out.slice(0, start) + state.out.slice(start).replace(/(?<!\\)\|/g, '\\|');
						});
						state.write(' |');
						state.ensureNewLine();
						if (i === 0) {
							const marks: string[] = [];
							row.forEach((cell: any) => marks.push(delimiter(cell.attrs.align)));
							state.write(`| ${marks.join(' | ')} |`);
							state.ensureNewLine();
						}
					});
					state.closeBlock(node);
					state.inTable = false;
				},
			},
		};
	},
});

/** Aligns every cell in the selected column(s). */
export function alignColumn(editor: Editor, value: string | null) {
	const { state, view } = editor;
	const rect = selectedRect(state);
	const positions = rect.map.cellsInRect({ left: rect.left, right: rect.right, top: 0, bottom: rect.map.height });
	const tr = state.tr;
	for (const pos of positions) {
		const at = rect.tableStart + pos;
		tr.setNodeMarkup(at, undefined, { ...state.doc.nodeAt(at)!.attrs, align: value });
	}
	view.dispatch(tr);
	editor.commands.focus();
}

export function columnAlignment(editor: Editor): string | null {
	try {
		const rect = selectedRect(editor.state);
		const pos = rect.map.map[rect.left];
		return editor.state.doc.nodeAt(rect.tableStart + pos)?.attrs.align || null;
	} catch {
		return null;
	}
}
