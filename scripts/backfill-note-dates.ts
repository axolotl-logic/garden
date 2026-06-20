// Backfill `created_at` / `modified_at` into note frontmatter from git history.
//
// - Scope: all tracked content/**/*.md
// - created_at = earliest git AUTHOR date across the file's history (follows renames)
// - modified_at = latest git AUTHOR date
//
// Author date (%aI) is used (not committer date) because it is preserved across
// rebases, so it reflects the original content-change time. Renames are followed
// with `git log --follow`. Min/max are computed explicitly so rebase-reordered
// author dates are handled correctly.
//
// Frontmatter is edited textually (not reserialized) so existing keys/formatting
// are preserved. Run with: npx tsx scripts/backfill-note-dates.ts

import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import yaml from "js-yaml"

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 })
}

const files = git(["ls-files", "-z", "content/*.md"]).split("\0").filter(Boolean)

function gitDates(file: string): { created: string; modified: string } | null {
  const out = git(["log", "--follow", "--no-show-signature", "--format=%aI", "--", file])
  const list = out.split("\n").map((s) => s.trim()).filter(Boolean)
  if (list.length === 0) return null
  let min = list[0]
  let max = list[0]
  let minT = Date.parse(min)
  let maxT = Date.parse(max)
  for (const d of list) {
    const t = Date.parse(d)
    if (t < minT) {
      minT = t
      min = d
    }
    if (t > maxT) {
      maxT = t
      max = d
    }
  }
  return { created: min, modified: max }
}

// Insert/replace created_at + modified_at in the frontmatter block, or prepend a
// new block if the file has none. Preserves all other keys and the body verbatim.
function upsertFrontmatter(text: string, created: string, modified: string): string {
  const nl = text.includes("\r\n") ? "\r\n" : "\n"
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (fm) {
    const lines = fm[1].split(/\r?\n/)
    const setKey = (key: string, val: string) => {
      const idx = lines.findIndex((l) => new RegExp(`^${key}\\s*:`).test(l))
      if (idx >= 0) lines[idx] = `${key}: ${val}`
      else lines.unshift(`${key}: ${val}`)
    }
    // set modified first, then created, so after unshifts created_at precedes modified_at
    setKey("modified_at", modified)
    setKey("created_at", created)
    const rest = text.slice(fm[0].length)
    return `---${nl}${lines.join(nl)}${nl}---${nl}${rest}`
  }
  return `---${nl}created_at: ${created}${nl}modified_at: ${modified}${nl}---${nl}${text}`
}

let changed = 0
let skipped = 0
const problems: string[] = []

for (const file of files) {
  const dates = gitDates(file)
  if (!dates) {
    problems.push(`no git history: ${file}`)
    skipped++
    continue
  }
  const before = readFileSync(file, "utf8")
  const after = upsertFrontmatter(before, dates.created, dates.modified)

  // validate the resulting frontmatter parses and has both keys
  const parsed = /^---\r?\n([\s\S]*?)\r?\n---/.exec(after)
  const data = parsed ? (yaml.load(parsed[1]) as Record<string, unknown>) : {}
  if (!data || data.created_at == null || data.modified_at == null) {
    problems.push(`validation failed: ${file}`)
    skipped++
    continue
  }

  if (after !== before) {
    writeFileSync(file, after)
    changed++
  }
}

console.log(`files scanned: ${files.length}`)
console.log(`files written: ${changed}`)
console.log(`skipped: ${skipped}`)
if (problems.length) {
  console.log("problems:")
  for (const p of problems) console.log(`  - ${p}`)
}
