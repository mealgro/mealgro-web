export interface TocItem {
	id: string;
	num: string;
	title: string;
}

export interface ParsedLegalDocument {
	html: string;
	toc: TocItem[];
}

export const padSectionNumber = (num: string) => num.padStart(2, "0");

/**
 * Enhances the rendered HTML of a numbered legal document (terms, privacy
 * policy, etc.) with a table of contents, section chips, clause-number
 * badges, and a highlighted contact card — driven entirely by tag structure
 * (h2 / p / hr) rather than by matching the document's specific wording, so
 * it keeps working if the source markdown is edited later.
 */
export function parseLegalDocument(rawHtml: string): ParsedLegalDocument {
	const container = document.createElement("div");
	container.innerHTML = rawHtml;

	// Every h2 becomes a TOC entry, numbered by its position in the document —
	// never by parsing digits out of its text, so a heading always gets an
	// id/chip even if the source content changes and drops or reformats its
	// own numbering. A leading "N. " in the heading text is stripped from the
	// displayed title only when present; its absence changes nothing.
	const headings = Array.from(container.querySelectorAll("h2"));
	const toc: TocItem[] = [];
	headings.forEach((heading, index) => {
		const num = String(index + 1);
		const rawTitle = (heading.textContent || "").trim();
		const title = rawTitle.replace(/^\d+\.\s*/, "") || rawTitle;
		const id = `section-${num}`;
		heading.id = id;
		heading.innerHTML = `<span class="chip" aria-hidden="true">${padSectionNumber(num)}</span><span class="chip-title">${title}</span>`;
		toc.push({ id, num, title });
	});

	// Clause numbers ("5.1 ...") are plain text, not their own tag, so this is
	// the one spot that still reads paragraph text — kept deliberately
	// lenient (optional trailing period, tolerant of extra spacing) so minor
	// future formatting drift degrades gracefully instead of breaking.
	container.querySelectorAll("p").forEach((paragraph) => {
		const inner = paragraph.innerHTML;
		const clauseMatch = inner.match(/^(\d+\.\d+)\.?\s+/);
		if (clauseMatch) {
			paragraph.innerHTML = inner.replace(
				/^(\d+\.\d+)\.?\s+/,
				`<span class="clause-num">${clauseMatch[1]}</span> `,
			);
		}
	});

	// The final section's body (contact details) gets wrapped into a
	// highlighted card. Driven entirely by structure — "everything after the
	// last heading, stopping at an <hr> if present" — not by matching any
	// specific text, so it works regardless of what the contact section says.
	const lastHeading = headings[headings.length - 1];
	if (lastHeading) {
		const card = document.createElement("div");
		card.className = "contact-card";
		let node = lastHeading.nextElementSibling;
		while (node && node.tagName !== "HR") {
			const next = node.nextElementSibling;
			card.appendChild(node);
			node = next;
		}
		lastHeading.after(card);
	}

	return { html: container.innerHTML, toc };
}
