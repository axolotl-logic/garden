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
    const homeCrumb: CrumbData = { displayName: options.rootName, path: pathToRoot(slug) }

    // Build one crumb per level of a nested tag, each linking to its tag page
    const tagCrumbs = (tagPath: string): CrumbData[] =>
      getAllSegmentPrefixes(tagPath).map((prefix) => ({
        displayName: (prefix.split("/").at(-1) ?? prefix).replaceAll("-", " "),
        path: resolveRelative(slug, `tags/${prefix}` as FullSlug),
      }))

    let crumbs: CrumbData[]

    if (slug === "tags" || slug.startsWith("tags/")) {
      // On a tag page the trail follows the tag slug itself
      const tagPath = slug === "tags" ? "" : slug.slice("tags/".length)
      crumbs = [homeCrumb, ...(tagPath ? tagCrumbs(tagPath) : [])]
      if (crumbs.length > 0) crumbs[crumbs.length - 1].path = ""
    } else {
      const tags = fileData.frontmatter?.tags ?? []
      if (tags.length > 0) {
        // Use the deepest (most specific) tag to build the trail
        const deepest = tags.reduce((a, b) => (b.split("/").length > a.split("/").length ? b : a))
        crumbs = [homeCrumb, ...tagCrumbs(deepest)]
        if (options.showCurrentPage) {
          crumbs.push({ displayName: fileData.frontmatter?.title ?? "", path: "" })
        }
      } else {
        // Untagged notes fall back to the folder hierarchy
        const trie = (ctx.trie ??= trieFromAllFiles(allFiles))
        const pathNodes = trie.ancestryChain(slug.split("/"))
        if (!pathNodes) {
          return null
        }

        crumbs = pathNodes.map((node, idx) => {
          const crumb = formatCrumb(node.displayName, slug, simplifySlug(node.slug))
          if (idx === 0) {
            crumb.displayName = options.rootName
          }

          // For last node (current page), set empty path
          if (idx === pathNodes.length - 1) {
            crumb.path = ""
          }

          return crumb
        })

        if (!options.showCurrentPage) {
          crumbs.pop()
        }
      }
    }

    return (
      <nav class={classNames(displayClass, "breadcrumb-container")} aria-label="breadcrumbs">
        {crumbs.map((crumb, index) => (
          <div class="breadcrumb-element">
            <a href={crumb.path}>{crumb.displayName}</a>
            {index !== crumbs.length - 1 && <p>{` ${options.spacerSymbol} `}</p>}
          </div>
        ))}
      </nav>
    )
  }
  Breadcrumbs.css = breadcrumbsStyle

  return Breadcrumbs
}) satisfies QuartzComponentConstructor
