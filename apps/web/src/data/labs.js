// AI Yatra Labs — curated reading lists per research track.
// Every entry below is a real, published paper verified on arXiv.
// AlphaXiv links mirror the same arXiv ID: https://www.alphaxiv.org/abs/<id>
// Sources are restricted to arXiv + AlphaXiv only. Last reviewed Sep 2026.

export const LABS_SOURCES = {
	arxiv: 'https://arxiv.org',
	alphaxiv: 'https://www.alphaxiv.org',
};

export const LABS_CATEGORIES = [
	{
		id: 'small-language-models',
		index: '01',
		title: 'Small Language Models',
		short: 'SLMs',
		tone: 'bg-tone-green',
		blurb:
			'Sub-billion to few-billion parameter models that run on phones and laptops — architecture choices, data recipes, and surveys that show how small models punch above their weight.',
		focus: [
			'Which architecture choices matter most under 1B parameters?',
			'How do data quality and synthetic data offset parameter count?',
			'What can SLMs actually do on-device today?',
		],
		papers: [
			{
				title: 'Phi-3 Technical Report: A Highly Capable Language Model Locally on Your Phone',
				authors: 'Abdin et al. (Microsoft)',
				year: '2024',
				arxivId: '2404.14219',
				tags: ['3.8B', 'on-device', 'synthetic data'],
				summary:
					'Phi-3-mini (3.8B) rivals Mixtral 8x7B and GPT-3.5 via heavily filtered web data plus synthetic data — the flagship evidence that data recipe beats scale for SLMs.',
			},
			{
				title: 'TinyLlama: An Open-Source Small Language Model',
				authors: 'Zhang et al.',
				year: '2024',
				arxivId: '2401.02385',
				tags: ['1.1B', 'open-source', 'long training'],
				summary:
					'A compact 1.1B Llama-2-style model pretrained on ~3T tokens, showing small models keep improving far past Chinchilla-optimal token counts.',
			},
			{
				title: 'MobileLLM: Optimizing Sub-billion Parameter Language Models for On-Device Use Cases',
				authors: 'Liu et al. (Meta)',
				year: '2024',
				arxivId: '2402.14905',
				tags: ['125M / 350M', 'deep-and-thin', 'weight sharing'],
				summary:
					'Systematic study for sub-billion models: deep-and-thin layouts, embedding sharing, grouped-query attention, and block-wise weight sharing for on-device deployment.',
			},
			{
				title: 'MobiLlama: Accurate and Lightweight Fully Transparent GPT for Resource-Constrained Computing',
				authors: 'Thawakar et al. (MBZUAI)',
				year: '2024',
				arxivId: '2402.16840',
				tags: ['0.5B', 'shared FFN', 'fully open'],
				summary:
					'A 0.5B SLM that shares one FFN across transformer blocks to cut pre-training and deployment cost, released with full data pipeline and 300+ checkpoints.',
			},
			{
				title: 'MiniCPM: Unveiling the Potential of Small Language Models with Scalable Training Strategies',
				authors: 'Hu et al.',
				year: '2024',
				arxivId: '2404.06395',
				tags: ['2B', 'training strategy', 'efficiency'],
				summary:
					'Scalable pre-training and alignment strategies that lift a ~2B model to competitive capability — a practical recipe for the Labs’ own SLM experiments.',
			},
			{
				title: 'Small Language Models: Survey, Measurements, and Insights',
				authors: 'Lu et al.',
				year: '2024',
				arxivId: '2409.15790',
				tags: ['survey', '70 models', 'on-device benchmarks'],
				summary:
					'First comprehensive survey of 70 open-source 100M–5B decoder-only SLMs, benchmarking capability and on-device latency/memory to map the whole track.',
			},
		],
	},
	{
		id: 'agent-harnesses',
		index: '02',
		title: 'Agent Harnesses & Scaffolding',
		short: 'Harnesses',
		tone: 'bg-tone-yellow',
		blurb:
			'The loop around the model — reasoning/action scaffolds, tool-use training, coding-agent interfaces, and skill libraries that turn a base LM into an engineer.',
		focus: [
			'How should the reason → act → observe loop be structured?',
			'What interface (tools vs. code) elicits the best agent behavior?',
			'How do agents accumulate reusable skills over time?',
		],
		papers: [
			{
				title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
				authors: 'Yao et al. (Google / Princeton)',
				year: '2022',
				arxivId: '2210.03629',
				tags: ['reason+act', 'foundational', 'prompting'],
				summary:
					'The foundational harness pattern: interleaved thought → action → observation traces. Every coding agent AIYatra builds (Claude Code–style loops included) descends from ReAct.',
			},
			{
				title: 'Toolformer: Language Models Can Teach Themselves to Use Tools',
				authors: 'Schick et al. (Meta)',
				year: '2023',
				arxivId: '2302.04761',
				tags: ['self-supervised', 'API calls', 'tool use'],
				summary:
					'LMs learn to call calculators, search, QA, and translation APIs via self-supervised filtering — the precursor to today’s tool-calling harnesses.',
			},
			{
				title: 'Voyager: An Open-Ended Embodied Agent with Large Language Models',
				authors: 'Wang et al. (NVIDIA / Caltech)',
				year: '2023',
				arxivId: '2305.16291',
				tags: ['skill library', 'curriculum', 'code actions'],
				summary:
					'Automatic curriculum plus an ever-growing library of executable code skills with iterative self-repair — the template for lifelong-learning agent scaffolds.',
			},
			{
				title: 'Executable Code Actions Elicit Better LLM Agents (CodeAct)',
				authors: 'Wang et al. (Ohio State / UCSD)',
				year: '2024',
				arxivId: '2402.01030',
				tags: ['code actions', 'OpenHands', 'unified action space'],
				summary:
					'Consolidating agent actions into executable Python instead of fixed tool menus improves performance ~20% — the idea behind OpenHands’ CodeAct agent AIYatra demos build on.',
			},
			{
				title: 'SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering',
				authors: 'Yang et al. (Princeton)',
				year: '2024',
				arxivId: '2405.15793',
				tags: ['SWE-bench', 'ACI design', 'coding harness'],
				summary:
					'Purpose-built agent-computer interfaces (viewer, editor, search guardrails) beat raw shell access on SWE-bench — required reading before designing any coding harness.',
			},
		],
	},
	{
		id: 'transformer-layers',
		index: '03',
		title: 'Inside Transformer Layers',
		short: 'Layers',
		tone: 'bg-tone-blue',
		blurb:
			'What each layer actually does — attention heads, induction circuits, MoE routing, and how knowledge distributes across depth. The mechanistic core of the Saturday paper-to-code sessions.',
		focus: [
			'Which heads and layers implement in-context learning?',
			'How do experts specialize (or fail to) in MoE layers?',
			'How does behavior change with depth during training?',
		],
		papers: [
			{
				title: 'Attention Is All You Need',
				authors: 'Vaswani et al. (Google)',
				year: '2017',
				arxivId: '1706.03762',
				tags: ['foundational', 'self-attention', 'reference'],
				summary:
					'The paper every layer study builds on: multi-head self-attention, positional encodings, and the encoder-decoder stack AIYatra reimplements line by line.',
			},
			{
				title: 'In-context Learning and Induction Heads',
				authors: 'Olsson et al. (Anthropic)',
				year: '2022',
				arxivId: '2209.11895',
				tags: ['induction heads', 'mechanistic', 'phase change'],
				summary:
					'Identifies two-layer induction circuits ([A][B]…[A]→[B]) as the likely mechanism behind most in-context learning, with a sharp training phase change.',
			},
			{
				title: 'What Needs to Go Right for an Induction Head? A Mechanistic Study of In-Context Learning Circuits',
				authors: 'Singh et al.',
				year: '2024',
				arxivId: '2404.07129',
				tags: ['induction circuits', 'causal analysis', 'dynamics'],
				summary:
					'Dissects the three subcircuits that must co-emerge for induction heads to form, explaining why they appear suddenly and how formation timing shifts with data.',
			},
			{
				title: 'A Closer Look into Mixture-of-Experts in Large Language Models',
				authors: 'Li et al.',
				year: '2024',
				arxivId: '2406.18219',
				tags: ['MoE', 'routing', 'expert diversity'],
				summary:
					'Studies Mixtral, DeepSeekMoE, and Grok-1 parameters and behavior: routers favor large-norm experts, diversity grows with depth, and neurons act as fine-grained experts.',
			},
			{
				title: 'Monet: Mixture of Monosemantic Experts for Transformers',
				authors: 'Park et al.',
				year: '2024',
				arxivId: '2412.04139',
				tags: ['262K experts', 'monosemanticity', 'interpretability'],
				summary:
					'Scales to 262,144 experts per layer with product-key composition so individual experts encapsulate disentangled knowledge — editable without hurting general performance.',
			},
			{
				title: 'Mixture of Experts Made Intrinsically Interpretable (MoE-X)',
				authors: 'Yang et al.',
				year: '2025',
				arxivId: '2503.07639',
				tags: ['MoE', 'sparsity', 'interpretability'],
				summary:
					'Rewrites MoE layers as wide sparse MLPs with ReLU experts and sparsity-aware routing, beating post-hoc SAE interpretability while matching dense performance.',
			},
		],
	},
	{
		id: 'new-architectures',
		index: '04',
		title: 'New Architecture Types',
		short: 'Architectures',
		tone: 'bg-tone-coral',
		blurb:
			'Beyond vanilla transformers — state-space models, linear RNNs, and hybrids that chase linear-time inference and million-token context without giving up quality.',
		focus: [
			'Can linear-time models match transformer quality?',
			'How should attention and SSM layers be mixed?',
			'What scales best to 256K+ context on limited hardware?',
		],
		papers: [
			{
				title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
				authors: 'Gu & Dao (CMU / Princeton)',
				year: '2023',
				arxivId: '2312.00752',
				tags: ['SSM', 'linear-time', 'selective scan'],
				summary:
					'Input-dependent selective SSMs with a hardware-aware scan: 5× transformer throughput, linear scaling to 1M tokens, and quality matching 2× larger transformers.',
			},
			{
				title: 'Jamba: A Hybrid Transformer-Mamba Language Model',
				authors: 'Lieber et al. (AI21 Labs)',
				year: '2024',
				arxivId: '2403.19887',
				tags: ['hybrid', 'MoE', '256K context'],
				summary:
					'Interleaved transformer + Mamba blocks with MoE (12B active / 52B total) fitting one 80GB GPU — the reference design for hybrid long-context architectures.',
			},
			{
				title: 'Zamba: A Compact 7B SSM Hybrid Model',
				authors: 'Glorioso et al. (Zyphra)',
				year: '2024',
				arxivId: '2405.16712',
				tags: ['7B', 'SSM-transformer', 'compact'],
				summary:
					'A compact 7B hybrid showing shared-attention SSM backbones can stay competitive — useful blueprint for Labs-scale hybrid experiments.',
			},
			{
				title: 'MambaInLlama: Distilling and Accelerating Hybrid Models',
				authors: 'Wang et al.',
				year: '2024',
				arxivId: '2408.15237',
				tags: ['distillation', 'hybridization', 'speculative decoding'],
				summary:
					'Reuses Llama-3 attention projections to distill linear-RNN hybrids on academic GPUs, plus hardware-aware speculative decoding for Mamba-family models.',
			},
			{
				title: 'TransMamba: A Sequence-Level Hybrid Transformer-Mamba Language Model',
				authors: 'Li et al.',
				year: '2025',
				arxivId: '2503.24067',
				tags: ['shared parameters', 'sequence-level', 'TransPoints'],
				summary:
					'Unifies attention and SSM through shared QKV/CBx parameters with a memory converter, switching mechanisms per token-length and layer instead of per layer.',
			},
			{
				title: 'RWKV-X: A Linear Complexity Hybrid Language Model',
				authors: 'Hou et al.',
				year: '2025',
				arxivId: '2504.21463',
				tags: ['RWKV', 'sparse attention', '1M tokens'],
				summary:
					'RWKV-7 blocks interleaved with sparse attention for linear training and constant-memory inference, decoding up to 1M tokens with near-perfect long retrieval.',
			},
		],
	},
];

export const LABS_TOTAL_PAPERS = LABS_CATEGORIES.reduce((n, c) => n + c.papers.length, 0);

export const arxivUrl = (id) => `https://arxiv.org/abs/${id}`;
export const alphaxivUrl = (id) => `https://www.alphaxiv.org/abs/${id}`;
