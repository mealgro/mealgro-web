// The star outline of a sticker ("TAP TO ORDER", "HUNGRY?"): a polygon clip
// with `points` tips. Rounded, so the server and the browser draw the same
// string and hydration matches.
export function burst(points: number) {
	const pts: string[] = [];
	for (let i = 0; i < points * 2; i++) {
		const a = (Math.PI * i) / points;
		const r = i % 2 ? 40 : 50;
		pts.push(`${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`);
	}
	return { clipPath: `polygon(${pts.join(",")})` };
}
