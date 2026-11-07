// Curated reading orders. Add a path here and it appears at /blog/paths, with
// next and previous links on each of its posts. Steps use the post's file name.
import type { Post } from '../lib/posts';

export interface LearningPath { id: string; title: string; summary: string; steps: string[] }

export const PATHS: LearningPath[] = [
	{
		id: 'zero-to-transformers',
		title: 'Zero to Transformers',
		summary: 'Start with the maths, then build the tools, then read and rebuild the papers behind today’s models.',
		steps: ['linear-algebra-to-transformers', 'pytorch-foundations', 'transformer-paper-to-code', 'deepseek-v3-from-scratch'],
	},
	{
		id: 'build-ai-agents',
		title: 'Build AI Agents',
		summary: 'Learn what an agent is, how the patterns fit together, then run a real one and build your own.',
		steps: ['agentic-ai-reading-1', 'agentic-ai-reading-2', 'agentic-ai-reading-3', 'agentic-ai-reading-4', 'goose-ai-agent-demo', 'harnessing-agentic-ai'],
	},
	{
		id: 'train-and-ship-models',
		title: 'Train and Ship Models',
		summary: 'Fine-tune a model, serve it faster, and check that what you deploy really does what you claim.',
		steps: ['pytorch-foundations', 'sft-to-rl', 'speculative-decoding-lab', 'tiny-dino-a-21-699-parameter-policy-that-plays-without-a-safety-net'],
	},
	{
		id: 'retrieval-and-memory',
		title: 'Retrieval and Memory',
		summary: 'See how text becomes vectors, how modern embedding models search it, and how LLMs can remember.',
		steps: ['linear-algebra-to-transformers', 'embeddinggemma-2-a-compact-multimodal-embedding-model', 'memorilla-for-frozen-llms-16-memory-tokens-and-4-212x-fewer-tokens-than-full-context'],
	},
];

/** A path's published posts, in order. Scheduled posts stay out until their date. */
export function stepsOf(path: LearningPath, posts: Post[]) {
	return path.steps.map((id) => posts.find((p) => p.id === id)).filter((p): p is Post => !!p);
}

/** Every path this post belongs to, with its place in each. */
export function pathsWith(postId: string, posts: Post[]) {
	return PATHS.flatMap((path) => {
		const steps = stepsOf(path, posts);
		const index = steps.findIndex((p) => p.id === postId);
		return index < 0 ? [] : [{ path, steps, index }];
	});
}
