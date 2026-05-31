import { FullSlug, getAllSegmentPrefixes, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

export function byDateAndAlphabetical(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

export function byDateAndAlphabeticalFolderFirst(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort folders first
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    // If both are folders or both are files, sort by date/alphabetical
    if (f1.dates && f2.dates) {
      // sort descending
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      // prioritize files with dates
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    // otherwise, sort lexographically by title
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

type Props = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

export const PageList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst(cfg)
  let list = allFiles.sort(sorter)
  if (limit) {
    list = list.slice(0, limit)
  }

  const currentTag = fileData.slug?.startsWith("tags/")
    ? fileData.slug.slice("tags/".length)
    : null

  return (
    <ul class="section-ul">
      {list.map((page) => {
        const title = page.frontmatter?.title
        const allTags = page.frontmatter?.tags ?? []
        const tags = currentTag
          ? allTags.filter((t) => t !== currentTag && !currentTag.startsWith(t + "/"))
          : allTags

        return (
          <li class="section-li">
            <div class="section">
              <p class="meta">
                {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
              </p>
              <div class="desc">
                <h3>
                  <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                    {title}
                  </a>
                </h3>
                {tags.length > 0 && (
                  <div class="tags">
                    {tags.map((tag) => {
                      const prefixes = getAllSegmentPrefixes(tag)
                      return (
                        <span class="tag-pill">
                          {prefixes.flatMap((prefix, idx) => {
                            const segment = prefix.split("/").at(-1)!
                            const link = (
                              <a
                                class="internal tag-segment"
                                href={resolveRelative(
                                  fileData.slug!,
                                  `tags/${prefix}` as FullSlug,
                                )}
                              >
                                {segment}
                              </a>
                            )
                            return idx === 0 ? [link] : ["/", link]
                          })}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

PageList.css = `
.section h3 {
  margin: 0;
}

.desc .tag-pill {
  display: inline-block;
  background-color: var(--highlight);
  border: 1px solid var(--lightgray);
  border-radius: 1rem;
  padding: 0 0.5rem;
  margin: 0 0.1rem;
  line-height: 1.5;
  font-size: 0.95em;
  white-space: nowrap;
}

.desc .tag-pill::before {
  content: "#";
  opacity: 0.6;
}

.desc .tag-pill a.tag-segment {
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  color: var(--secondary);
}

.desc .tag-pill a.tag-segment:hover {
  color: var(--tertiary);
}
`
