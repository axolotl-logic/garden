#!/usr/bin/env python
"""Parse a directory of markdown, build a wikilink graph, and print statistics.

Builds a directed graph where each note is a node and each ``[[wikilink]]`` is an
edge. Targets that are linked but have no corresponding file are kept as
"missing" nodes (i.e. broken links / stubs worth writing).

Dependencies (third-party):
    pip install networkx rich

Usage:
    python garden_graph.py [DIR] [--include-images]
"""

from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
from pathlib import Path

import networkx as nx
from rich.console import Console
from rich.table import Table

# [[Target]] or [[Target|alias]] or [[Target#heading]]; capture the target only.
WIKILINK = re.compile(r"\[\[([^\]\|#]+)(?:#[^\]\|]+)?(?:\|[^\]]+)?\]\]")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".pdf"}


def extract_links(text: str) -> list[str]:
    """Return the de-duplicated, order-preserved wikilink targets in *text*."""
    seen: dict[str, None] = {}
    for match in WIKILINK.finditer(text):
        seen.setdefault(match.group(1).strip(), None)
    return list(seen)


def build_graph(directory: Path, include_images: bool) -> nx.DiGraph:
    graph = nx.DiGraph()

    files = sorted(directory.rglob("*.md"))
    if not files:
        sys.exit(f"No markdown files found under {directory}")

    # First pass: every file is a real node.
    for path in files:
        graph.add_node(path.stem, exists=True)

    # Second pass: add edges, marking unseen targets as missing nodes.
    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = path.read_text(encoding="utf-8", errors="replace")
        for target in extract_links(text):
            if not include_images and Path(target).suffix.lower() in IMAGE_EXTS:
                continue
            if target not in graph:
                graph.add_node(target, exists=False)
            graph.add_edge(path.stem, target)
    return graph


def _table(title: str, columns: list[str]) -> Table:
    table = Table(title=title, title_justify="left", header_style="bold cyan")
    for i, col in enumerate(columns):
        table.add_column(col, justify="right" if i else "left")
    return table


def _pct(ratio: float) -> str:
    return f"{100 * ratio:.1f}%"


def compute_stats(graph: nx.DiGraph) -> dict:
    """Compute every statistic once into a plain, JSON-serialisable dict."""
    existing = [n for n, d in graph.nodes(data=True) if d["exists"]]
    missing = [n for n, d in graph.nodes(data=True) if not d["exists"]]
    n_notes = len(existing)
    n_nodes = graph.number_of_nodes()

    # Orphans: existing notes with no link in or out (to/from any node).
    orphans = sorted(
        n for n in existing if graph.in_degree(n) == 0 and graph.out_degree(n) == 0
    )
    # Dead ends: existing notes that nothing links out of (but may be linked to).
    dead_ends = sorted(
        n for n in existing if graph.out_degree(n) == 0 and graph.in_degree(n) > 0
    )
    # Per-note degrees (over existing notes only, so targets aren't skewed by stubs).
    out_degs = [graph.out_degree(n) for n in existing]
    in_degs = [graph.in_degree(n) for n in existing]
    with_outgoing = sum(1 for d in out_degs if d)
    backlinked = sum(1 for d in in_degs if d)

    components = sorted(
        nx.connected_components(graph.to_undirected()), key=len, reverse=True
    )
    singletons = [c for c in components if len(c) == 1]
    clusters = [c for c in components if len(c) > 1]
    largest = len(components[0]) if components else 0
    smallest = len(components[-1]) if components else 0

    def ratio(part: int, whole: int) -> float:
        return round(part / whole, 4) if whole else 0.0

    return {
        "structure": {
            "notes": n_notes,
            "missing_targets": len(missing),
            "edges": graph.number_of_edges(),
            "components": len(components),
            "clusters": len(clusters),
            "singletons": len(singletons),
            "largest_component": largest,
            "smallest_component": smallest,
            "cluster_sizes": [len(c) for c in clusters],
        },
        "metrics": {
            "orphan_rate": ratio(len(orphans), n_notes),
            "dead_end_rate": ratio(len(dead_ends) + len(orphans), n_notes),
            "connected_coverage": ratio(largest, n_nodes),
            "pct_with_outgoing": ratio(with_outgoing, n_notes),
            "pct_backlinked": ratio(backlinked, n_notes),
            "broken_link_rate": ratio(len(missing), n_nodes),
            "avg_outgoing": round(statistics.mean(out_degs), 4) if out_degs else 0.0,
            "median_backlinks": statistics.median(in_degs) if in_degs else 0,
            "density": round(nx.density(graph), 4),
            "reciprocity": round(nx.overall_reciprocity(graph), 4),
        },
        "orphans": orphans,
        "dead_ends": dead_ends,
        "missing": [
            {"target": n, "refs": graph.in_degree(n)}
            for n in sorted(missing, key=graph.in_degree, reverse=True)
        ],
    }


def report(stats: dict, console: Console) -> None:
    s, m = stats["structure"], stats["metrics"]

    # --- Structure summary ---
    summary = _table("Summary", ["metric", "value"])
    summary.add_row("Notes (files)", str(s["notes"]))
    summary.add_row("Edges (links)", str(s["edges"]))
    summary.add_row("Isolated subgraphs (components)", str(s["components"]))
    summary.add_row("  ↳ multi-note clusters", str(s["clusters"]))
    summary.add_row("  ↳ orphans", str(s["singletons"]))
    summary.add_row("Largest component size", str(s["largest_component"]))
    summary.add_row("Smallest component size", str(s["smallest_component"]))
    console.print(summary)

    # --- Target-friendly metrics (ratios you can set goals against) ---
    targets = _table("Metrics", ["metric", "value"])
    targets.add_row("Orphan rate (lower is better)", _pct(m["orphan_rate"]))
    targets.add_row("Dead-end rate (no outgoing links)", _pct(m["dead_end_rate"]))
    targets.add_row(
        "Connected coverage (in largest cluster)", _pct(m["connected_coverage"])
    )
    targets.add_row("Notes with ≥1 outgoing link", _pct(m["pct_with_outgoing"]))
    targets.add_row(
        "Notes that are backlinked (≥1 incoming)", _pct(m["pct_backlinked"])
    )
    targets.add_row("Avg outgoing links / note", f"{m['avg_outgoing']:.2f}")
    targets.add_row("Median backlinks / note", f"{m['median_backlinks']:.1f}")
    console.print(targets)

    # --- Broken links / stubs to write ---
    if stats["missing"]:
        broken = _table("Linked-but-missing notes (write these)", ["target", "refs"])
        for row in stats["missing"]:
            broken.add_row(row["target"], str(row["refs"]))
        console.print(broken)

    # --- Fragmentation ---
    if s["components"] > 1:
        console.print(
            f"\n[bold]Graph is fragmented into {s['components']} isolated subgraphs[/] "
            f"({s['clusters']} clusters + {s['singletons']} singletons). "
            "Cluster sizes: "
            + ", ".join(str(n) for n in s["cluster_sizes"][:15])
            + (" ..." if s["clusters"] > 15 else "")
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        type=Path,
        help="Directory of markdown files (defaults to current directory)",
    )
    parser.add_argument(
        "--include-images",
        action="store_true",
        help="Treat image/PDF embeds as graph nodes too",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit stats as JSON to stdout instead of tables",
    )
    args = parser.parse_args()

    if not args.directory.is_dir():
        sys.exit(f"Not a directory: {args.directory}")

    graph = build_graph(args.directory, args.include_images)
    stats = compute_stats(graph)

    if args.json:
        json.dump(stats, sys.stdout, indent=2, ensure_ascii=False)
        sys.stdout.write("\n")
    else:
        report(stats, Console())


if __name__ == "__main__":
    main()
