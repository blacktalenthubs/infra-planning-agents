export interface Env {
	AI: Ai;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/health") {
			return Response.json({ ok: true, service: "ipa-01-agent-basics" });
		}

		// TODO (Project 01): POST /analyze — deterministic stats tools,
		// a Workers AI call with tool calling, validated structured output.
		// Full spec in ../BRIEF.md.
		return Response.json({
			ok: true,
			hint: "Toolchain works. POST /analyze is yours to build — see BRIEF.md.",
		});
	},
};
