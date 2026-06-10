import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import breadcrumbsStyle from "./styles/breadcrumbs.scss"
import {
  FullSlug,
  SimpleSlug,
  getAllSegmentPrefixes,
  pathToRoot,
  resolveRelative,
  simplifySlug,
} from "../util/path"
import { classNames } from "../util/lang"
import { trieFromAllFiles } from "../util/ctx"

type CrumbData = {
  displayName: string
  path: string
}

// A crumb plus a stable key used to detect segments shared between trails
type Segment = CrumbData & { key: string }

interface BreadcrumbOptions {
  /**
   * Symbol between crumbs
   */
  spacerSymbol: string
  /**
   * Name of first crumb
   */
  rootName: string
  /**
   * Whether to look up frontmatter title for folders (could cause performance problems with big vaults)
   */
  resolveFrontmatterTitle: boolean
  /**
   * Whether to display the current page in the breadcrumbs.
   */
  showCurrentPage: boolean
}

const defaultOptions: BreadcrumbOptions = {
  spacerSymbol: "❯",
  rootName: "Home",
  resolveFrontmatterTitle: true,
  showCurrentPage: true,
}

function formatCrumb(displayName: string, baseSlug: FullSlug, currentSlug: SimpleSlug): CrumbData {
  return {
    displayName: displayName.replaceAll("-", " "),
    path: resolveRelative(baseSlug, currentSlug),
  }
}

export default ((opts?: Partial<BreadcrumbOptions>) => {
  const options: BreadcrumbOptions = { ...defaultOptions, ...opts }
  const Breadcrumbs: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
    ctx,
  }: QuartzComponentProps) => {
    const slug = fileData.slug!
    let homeCrumb: CrumbData = { displayName: options.rootName, path: pathToRoot(slug) }

    // Build one crumb per level of a nested tag, each linking to its tag page.
    // The cumulative prefix is the key, so equal keys mean a shared ancestry.
    const tagCrumbs = (tagPath: string): Segment[] =>
      getAllSegmentPrefixes(tagPath).map((prefix) => ({
        displayName: (prefix.split("/").at(-1) ?? prefix).replaceAll("-", " "),
        path: resolveRelative(slug, `tags/${prefix}` as FullSlug),
        key: prefix,
      }))

    // Each trail renders on its own line, aligned after the Home crumb
    let trails: Segment[][]

    if (slug === "tags" || slug.startsWith("tags/")) {
      // On a tag page the trail follows the tag slug itself
      const tagPath = slug === "tags" ? "" : slug.slice("tags/".length)
      const trail = tagPath ? tagCrumbs(tagPath) : []
      if (trail.length > 0) trail[trail.length - 1].path = ""
      trails = [trail]
    } else {
      const tags = fileData.frontmatter?.tags ?? []
      if (tags.length > 0) {
        // Count how many notes carry each tag across the whole site
        const tagCounts = new Map<string, number>()
        for (const file of allFiles) {
          for (const tag of file.frontmatter?.tags ?? []) {
            tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
          }
        }

        // Pick this note's three most popular tags by note count, then order
        // them lexicographically so trails sharing ancestry line up adjacently
        const topTags = [...tags]
          .sort((a, b) => (tagCounts.get(b) ?? 0) - (tagCounts.get(a) ?? 0))
          .slice(0, 3)
          .sort()
        trails = topTags.map((tag) => tagCrumbs(tag))
      } else {
        // Untagged notes fall back to the folder hierarchy
        const trie = (ctx.trie ??= trieFromAllFiles(allFiles))
        const pathNodes = trie.ancestryChain(slug.split("/"))
        if (!pathNodes) {
          return null
        }

        const folderCrumbs: Segment[] = pathNodes.map((node, idx) => {
          const crumb = formatCrumb(node.displayName, slug, simplifySlug(node.slug))
          if (idx === 0) {
            crumb.displayName = options.rootName
          }

          // For last node (current page), set empty path
          if (idx === pathNodes.length - 1) {
            crumb.path = ""
          }

          return { ...crumb, key: node.slug }
        })

        if (!options.showCurrentPage) {
          folderCrumbs.pop()
        }

        // First node is Home; the rest forms the single folder trail
        homeCrumb = folderCrumbs[0] ?? homeCrumb
        trails = [folderCrumbs.slice(1)]
      }
    }

    // Number of leading segments two trails share (so we can omit the repeats)
    const sharedPrefixLen = (a: Segment[], b: Segment[]): number => {
      let i = 0
      while (i < a.length && i < b.length && a[i].key === b[i].key) i++
      return i
    }

    // One column for Home, then one column per segment depth, so segments at
    // the same depth line up vertically across every line
    const maxDepth = Math.max(0, ...trails.map((trail) => trail.length))
    const gridStyle = `grid-template-columns: repeat(${maxDepth + 1}, max-content) auto;`

    return (
      <nav
        class={classNames(displayClass, "breadcrumb-container")}
        style={gridStyle}
        aria-label="breadcrumbs"
      >
        {trails.map((trail, rowIdx) => {
          const shared = rowIdx === 0 ? 0 : sharedPrefixLen(trails[rowIdx - 1], trail)
          return (
            <>
              <div class="breadcrumb-home">
                {rowIdx === 0 && <a href={homeCrumb.path}>{homeCrumb.displayName}</a>}
              </div>
              {trail.map((crumb, i) => (
                <div class="breadcrumb-element">
                  {i >= shared && (
                    <>
                      <span class="breadcrumb-spacer">{` ${options.spacerSymbol} `}</span>
                      <a href={crumb.path}>{crumb.displayName}</a>
                    </>
                  )}
                </div>
              ))}
            </>
          )
        })}
      </nav>
    )
  }
  Breadcrumbs.css = breadcrumbsStyle

  return Breadcrumbs
}) satisfies QuartzComponentConstructor
