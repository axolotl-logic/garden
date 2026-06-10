import { FileTrieNode } from "../../util/fileTrie"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

type MaybeHTMLElement = HTMLElement | undefined

interface ParsedOptions {
  folderClickBehavior: "collapse" | "link"
  folderDefaultState: "collapsed" | "open"
  useSavedState: boolean
  useTags: boolean
  sortFn: (a: FileTrieNode, b: FileTrieNode) => number
  filterFn: (node: FileTrieNode) => boolean
  mapFn: (node: FileTrieNode) => void
  order: "sort" | "filter" | "map"[]
}

// Node in the nested-tag hierarchy used when the explorer is in tag mode
interface TagTreeNode {
  segment: string
  tagPath: string
  children: Map<string, TagTreeNode>
  count: number
}

type FolderState = {
  path: string
  collapsed: boolean
}

let currentExplorerState: Array<FolderState>
function toggleExplorer(this: HTMLElement) {
  const nearestExplorer = this.closest(".explorer") as HTMLElement
  if (!nearestExplorer) return
  const explorerCollapsed = nearestExplorer.classList.toggle("collapsed")
  nearestExplorer.setAttribute(
    "aria-expanded",
    nearestExplorer.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )

  if (!explorerCollapsed) {
    // Stop <html> from being scrollable when mobile explorer is open
    document.documentElement.classList.add("mobile-no-scroll")
  } else {
    document.documentElement.classList.remove("mobile-no-scroll")
  }
}

function toggleFolder(evt: MouseEvent) {
  evt.stopPropagation()
  const target = evt.target as MaybeHTMLElement
  if (!target) return

  // Check if target was svg icon or button
  const isSvg = target.nodeName === "svg"

  // corresponding <ul> element relative to clicked button/folder
  const folderContainer = (
    isSvg
      ? // svg -> div.folder-container
        target.parentElement
      : // button.folder-button -> div -> div.folder-container
        target.parentElement?.parentElement
  ) as MaybeHTMLElement
  if (!folderContainer) return
  const childFolderContainer = folderContainer.nextElementSibling as MaybeHTMLElement
  if (!childFolderContainer) return

  childFolderContainer.classList.toggle("open")

  // Collapse folder container
  const isCollapsed = !childFolderContainer.classList.contains("open")
  setFolderState(childFolderContainer, isCollapsed)

  const currentFolderState = currentExplorerState.find(
    (item) => item.path === folderContainer.dataset.folderpath,
  )
  if (currentFolderState) {
    currentFolderState.collapsed = isCollapsed
  } else {
    currentExplorerState.push({
      path: folderContainer.dataset.folderpath as FullSlug,
      collapsed: isCollapsed,
    })
  }

  const stringifiedFileTree = JSON.stringify(currentExplorerState)
  localStorage.setItem("fileTree", stringifiedFileTree)
}

function createFileNode(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  const template = document.getElementById("template-file") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const a = li.querySelector("a") as HTMLAnchorElement
  a.href = resolveRelative(currentSlug, node.slug)
  a.dataset.for = node.slug
  a.textContent = node.displayName

  if (currentSlug === node.slug) {
    a.classList.add("active")
  }

  return li
}

function createFolderNode(
  currentSlug: FullSlug,
  node: FileTrieNode,
  opts: ParsedOptions,
): HTMLLIElement {
  const template = document.getElementById("template-folder") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const folderContainer = li.querySelector(".folder-container") as HTMLElement
  const titleContainer = folderContainer.querySelector("div") as HTMLElement
  const folderOuter = li.querySelector(".folder-outer") as HTMLElement
  const ul = folderOuter.querySelector("ul") as HTMLUListElement

  const folderPath = node.slug
  folderContainer.dataset.folderpath = folderPath

  if (currentSlug === folderPath) {
    folderContainer.classList.add("active")
  }

  if (opts.folderClickBehavior === "link") {
    // Replace button with link for link behavior
    const button = titleContainer.querySelector(".folder-button") as HTMLElement
    const a = document.createElement("a")
    a.href = resolveRelative(currentSlug, folderPath)
    a.dataset.for = folderPath
    a.className = "folder-title"
    a.textContent = node.displayName
    button.replaceWith(a)
  } else {
    const span = titleContainer.querySelector(".folder-title") as HTMLElement
    span.textContent = node.displayName
  }

  // if the saved state is collapsed or the default state is collapsed
  const isCollapsed =
    currentExplorerState.find((item) => item.path === folderPath)?.collapsed ??
    opts.folderDefaultState === "collapsed"

  // if this folder is a prefix of the current path we
  // want to open it anyways
  const simpleFolderPath = simplifySlug(folderPath)
  const folderIsPrefixOfCurrentSlug =
    simpleFolderPath === currentSlug.slice(0, simpleFolderPath.length)

  if (!isCollapsed || folderIsPrefixOfCurrentSlug) {
    folderOuter.classList.add("open")
  }

  for (const child of node.children) {
    const childNode = child.isFolder
      ? createFolderNode(currentSlug, child, opts)
      : createFileNode(currentSlug, child)
    ul.appendChild(childNode)
  }

  return li
}

// Maximum number of nested subhashtags to display under a parent tag
const MAX_SUBHASHTAGS = 3

function tagSegmentSort(a: TagTreeNode, b: TagTreeNode): number {
  // most-used tags first, breaking ties alphabetically
  if (a.count !== b.count) return b.count - a.count
  return a.segment.localeCompare(b.segment, undefined, { numeric: true, sensitivity: "base" })
}

// Build the nested tag hierarchy from the content index. Every prefix of every tag becomes
// a node, and each node's count is the number of distinct notes carrying that tag or any
// descendant tag (matching how tag pages list their contents).
function buildTagTree(data: Record<string, ContentDetails>): TagTreeNode {
  const root: TagTreeNode = { segment: "", tagPath: "", children: new Map(), count: 0 }
  const slugsByTag = new Map<string, Set<string>>()

  const ensure = (tagPath: string): void => {
    const segments = tagPath.split("/")
    let node = root
    const acc: string[] = []
    for (const seg of segments) {
      acc.push(seg)
      let child = node.children.get(seg)
      if (!child) {
        child = { segment: seg, tagPath: acc.join("/"), children: new Map(), count: 0 }
        node.children.set(seg, child)
      }
      node = child
    }
  }

  for (const [slug, details] of Object.entries(data)) {
    for (const tag of details.tags ?? []) {
      for (const prefix of getAllSegmentPrefixes(tag)) {
        ensure(prefix)
        let set = slugsByTag.get(prefix)
        if (!set) {
          set = new Set()
          slugsByTag.set(prefix, set)
        }
        set.add(slug)
      }
    }
  }

  const assignCounts = (node: TagTreeNode) => {
    if (node.tagPath) node.count = slugsByTag.get(node.tagPath)?.size ?? 0
    node.children.forEach(assignCounts)
  }
  assignCounts(root)

  return root
}

// Collect the slugs of all tag nodes that have children (i.e. expandable parents)
function tagFolderPaths(node: TagTreeNode, acc: FullSlug[] = []): FullSlug[] {
  for (const child of node.children.values()) {
    if (child.children.size > 0) {
      acc.push(`tags/${child.tagPath}` as FullSlug)
      tagFolderPaths(child, acc)
    }
  }
  return acc
}

function createTagLeafNode(currentSlug: FullSlug, node: TagTreeNode): HTMLLIElement {
  const template = document.getElementById("template-file") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const a = li.querySelector("a") as HTMLAnchorElement
  const tagSlug = `tags/${node.tagPath}` as FullSlug
  a.href = resolveRelative(currentSlug, tagSlug)
  a.dataset.for = tagSlug
  a.textContent = `#${node.segment}`

  const count = document.createElement("span")
  count.className = "tag-count"
  count.textContent = String(node.count)
  a.appendChild(count)

  if (currentSlug === tagSlug) {
    a.classList.add("active")
  }

  return li
}

function createTagFolderNode(
  currentSlug: FullSlug,
  node: TagTreeNode,
  opts: ParsedOptions,
): HTMLLIElement {
  const template = document.getElementById("template-folder") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const folderContainer = li.querySelector(".folder-container") as HTMLElement
  const titleContainer = folderContainer.querySelector("div") as HTMLElement
  const folderOuter = li.querySelector(".folder-outer") as HTMLElement
  const ul = folderOuter.querySelector("ul") as HTMLUListElement

  const tagSlug = `tags/${node.tagPath}` as FullSlug
  folderContainer.dataset.folderpath = tagSlug

  // Parent tags expand/collapse on click rather than navigating, so keep the button.
  const span = titleContainer.querySelector(".folder-title") as HTMLElement
  span.textContent = node.segment
  const count = document.createElement("span")
  count.className = "tag-count"
  count.textContent = String(node.count)
  span.appendChild(count)

  if (currentSlug === tagSlug) {
    folderContainer.classList.add("active")
  }

  const isCollapsed =
    currentExplorerState.find((item) => item.path === tagSlug)?.collapsed ??
    opts.folderDefaultState === "collapsed"

  // Open ancestors of the current tag page so the active node is revealed
  const simpleFolderPath = simplifySlug(tagSlug)
  const folderIsPrefixOfCurrentSlug =
    simpleFolderPath === currentSlug.slice(0, simpleFolderPath.length)

  if (!isCollapsed || folderIsPrefixOfCurrentSlug) {
    folderOuter.classList.add("open")
  }

  // Only surface the top few subhashtags (most-used first) to keep the tree compact
  const children = [...node.children.values()].sort(tagSegmentSort).slice(0, MAX_SUBHASHTAGS)
  for (const child of children) {
    ul.appendChild(
      child.children.size > 0
        ? createTagFolderNode(currentSlug, child, opts)
        : createTagLeafNode(currentSlug, child),
    )
  }

  return li
}

async function setupExplorer(currentSlug: FullSlug) {
  const allExplorers = document.querySelectorAll("div.explorer") as NodeListOf<HTMLElement>

  for (const explorer of allExplorers) {
    const dataFns = JSON.parse(explorer.dataset.dataFns || "{}")
    const opts: ParsedOptions = {
      folderClickBehavior: (explorer.dataset.behavior || "collapse") as "collapse" | "link",
      folderDefaultState: (explorer.dataset.collapsed || "collapsed") as "collapsed" | "open",
      useSavedState: explorer.dataset.savestate === "true",
      useTags: explorer.dataset.useTags === "true",
      order: dataFns.order || ["filter", "map", "sort"],
      sortFn: new Function("return " + (dataFns.sortFn || "undefined"))(),
      filterFn: new Function("return " + (dataFns.filterFn || "undefined"))(),
      mapFn: new Function("return " + (dataFns.mapFn || "undefined"))(),
    }

    // Get folder state from local storage
    const storageTree = localStorage.getItem("fileTree")
    const serializedExplorerState = storageTree && opts.useSavedState ? JSON.parse(storageTree) : []
    const oldIndex = new Map<string, boolean>(
      serializedExplorerState.map((entry: FolderState) => [entry.path, entry.collapsed]),
    )

    const data = await fetchData

    let folderPaths: FullSlug[]
    let tagRoot: TagTreeNode | undefined
    let trie: FileTrieNode | undefined

    if (opts.useTags) {
      tagRoot = buildTagTree(data)
      folderPaths = tagFolderPaths(tagRoot)
    } else {
      const entries = [...Object.entries(data)] as [FullSlug, ContentDetails][]
      trie = FileTrieNode.fromEntries(entries)

      // Apply functions in order
      for (const fn of opts.order) {
        switch (fn) {
          case "filter":
            if (opts.filterFn) trie.filter(opts.filterFn)
            break
          case "map":
            if (opts.mapFn) trie.map(opts.mapFn)
            break
          case "sort":
            if (opts.sortFn) trie.sort(opts.sortFn)
            break
        }
      }

      folderPaths = trie.getFolderPaths()
    }

    // Get folder paths for state management
    currentExplorerState = folderPaths.map((path) => {
      const previousState = oldIndex.get(path)
      return {
        path,
        collapsed:
          previousState === undefined ? opts.folderDefaultState === "collapsed" : previousState,
      }
    })

    const explorerUl = explorer.querySelector(".explorer-ul")
    if (!explorerUl) continue

    // Create and insert new content
    const fragment = document.createDocumentFragment()
    if (opts.useTags && tagRoot) {
      const topLevel = [...tagRoot.children.values()].sort(tagSegmentSort)
      for (const child of topLevel) {
        fragment.appendChild(
          child.children.size > 0
            ? createTagFolderNode(currentSlug, child, opts)
            : createTagLeafNode(currentSlug, child),
        )
      }
    } else if (trie) {
      for (const child of trie.children) {
        const node = child.isFolder
          ? createFolderNode(currentSlug, child, opts)
          : createFileNode(currentSlug, child)

        fragment.appendChild(node)
      }
    }
    explorerUl.insertBefore(fragment, explorerUl.firstChild)

    // Set up event handlers
    const explorerButtons = explorer.getElementsByClassName(
      "explorer-toggle",
    ) as HTMLCollectionOf<HTMLElement>
    for (const button of explorerButtons) {
      button.addEventListener("click", toggleExplorer)
      window.addCleanup(() => button.removeEventListener("click", toggleExplorer))
    }

    // Set up folder click handlers. In tag mode, parent tags always expand/collapse.
    if (opts.folderClickBehavior === "collapse" || opts.useTags) {
      const folderButtons = explorer.getElementsByClassName(
        "folder-button",
      ) as HTMLCollectionOf<HTMLElement>
      for (const button of folderButtons) {
        button.addEventListener("click", toggleFolder)
        window.addCleanup(() => button.removeEventListener("click", toggleFolder))
      }
    }

    const folderIcons = explorer.getElementsByClassName(
      "folder-icon",
    ) as HTMLCollectionOf<HTMLElement>
    for (const icon of folderIcons) {
      icon.addEventListener("click", toggleFolder)
      window.addCleanup(() => icon.removeEventListener("click", toggleFolder))
    }
  }
}

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const currentSlug = e.detail.url
  await setupExplorer(currentSlug)

  // if mobile hamburger is visible, collapse by default
  for (const explorer of document.getElementsByClassName("explorer")) {
    const mobileExplorer = explorer.querySelector(".mobile-explorer")
    if (!mobileExplorer) return

    if (mobileExplorer.checkVisibility()) {
      explorer.classList.add("collapsed")
      explorer.setAttribute("aria-expanded", "false")

      // Allow <html> to be scrollable when mobile explorer is collapsed
      document.documentElement.classList.remove("mobile-no-scroll")
    }

    mobileExplorer.classList.remove("hide-until-loaded")
  }
})

window.addEventListener("resize", function () {
  // Desktop explorer opens by default, and it stays open when the window is resized
  // to mobile screen size. Applies `no-scroll` to <html> in this edge case.
  const explorer = document.querySelector(".explorer")
  if (explorer && !explorer.classList.contains("collapsed")) {
    document.documentElement.classList.add("mobile-no-scroll")
    return
  }
})

function setFolderState(folderElement: HTMLElement, collapsed: boolean) {
  return collapsed ? folderElement.classList.remove("open") : folderElement.classList.add("open")
}
