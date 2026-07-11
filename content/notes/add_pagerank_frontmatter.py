#!/usr/bin/env python3
"""Add PageRank and cluster metadata to the frontmatter of every note in an
Obsidian vault.

For each markdown file that exists in the vault, this writes three keys:

  - global_pagerank:  PageRank computed over the entire vault link graph.
  - cluster_pagerank: PageRank computed over only the note's own cluster
                      (the connected component it belongs to, treated as an
                      undirected subgraph).
  - cluster_id:       md5 hex digest of the concatenation of all note names
                      (file names) in the cluster, sorted alphabetically.

Usage:
    python add_pagerank_frontmatter.py [VAULT_DIR]
    python add_pagerank_frontmatter.py [VAULT_DIR] --dry-run

--dry-run computes everything but writes nothing; instead it prints a CSV of
name,global_pagerank,cluster_pagerank,cluster_id to stdout.

VAULT_DIR defaults to the current directory.
"""

import argparse
import csv
import hashlib
import sys
from pathlib import Path

import frontmatter
import networkx as nx
import obsidiantools.api as otools


def compute_cluster_id(note_names):
    """md5 of the sorted, concatenated note names in a cluster."""
    joined = "".join(sorted(note_names))
    return hashlib.md5(joined.encode("utf-8")).hexdigest()


def main(vault_dir, dry_run=False):
    vault_dir = Path(vault_dir).expanduser().resolve()

    # Load the vault and build the link graph.
    vault = otools.Vault(vault_dir).connect().gather()
    graph = vault.graph  # networkx directed graph of note links

    # Global PageRank over the whole (directed) graph.
    global_pagerank = nx.pagerank(graph) if graph.number_of_nodes() else {}

    # Clusters = connected components of the undirected graph.
    undirected = graph.to_undirected()
    cluster_pagerank = {}
    cluster_ids = {}
    for component in nx.connected_components(undirected):
        cid = compute_cluster_id(component)
        subgraph = graph.subgraph(component)
        sub_pr = nx.pagerank(subgraph) if subgraph.number_of_nodes() else {}
        for node in component:
            cluster_ids[node] = cid
            cluster_pagerank[node] = sub_pr.get(node, 0.0)

    if dry_run:
        writer = csv.writer(sys.stdout)
        writer.writerow(["name", "global_pagerank", "cluster_pagerank", "cluster_id"])

    # Write metadata back into the frontmatter of files that actually exist.
    updated = 0
    for note_name, rel_path in vault.md_file_index.items():
        file_path = vault_dir / rel_path
        if not file_path.is_file():
            continue

        g_pr = float(global_pagerank.get(note_name, 0.0))
        c_pr = float(cluster_pagerank.get(note_name, 0.0))
        cid = cluster_ids.get(note_name, compute_cluster_id([note_name]))

        if dry_run:
            writer.writerow([note_name, g_pr, c_pr, cid])
            updated += 1
            continue

        post = frontmatter.load(file_path)
        post["global_pagerank"] = g_pr
        post["cluster_pagerank"] = c_pr
        post["cluster_id"] = cid

        with open(file_path, "wb") as f:
            frontmatter.dump(post, f)
        updated += 1

    if not dry_run:
        print(f"Updated frontmatter in {updated} notes across "
              f"{len(set(cluster_ids.values()))} clusters.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("vault_dir", nargs="?", default=".",
                        help="Path to the Obsidian vault (default: current directory).")
    parser.add_argument("--dry-run", action="store_true",
                        help="Compute but don't write; print name,values as CSV to stdout.")
    args = parser.parse_args()
    main(args.vault_dir, dry_run=args.dry_run)
