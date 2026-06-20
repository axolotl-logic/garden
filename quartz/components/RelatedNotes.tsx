import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, simplifySlug } from "../util/path"
import { classNames } from "../util/lang"
import style from "./styles/relatedNotes.scss"

interface Options {
  limit: number
}

const defaultOptions: Options = {
  limit: 5,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const RelatedNotes: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = simplifySlug(fileData.slug!)
    const tags = new Set(fileData.frontmatter?.tags ?? [])
    if (tags.size === 0) {
      return null
    }

    // score other notes by number of shared tags; drop the current page and zero-overlap pages
    const scored = allFiles
      .filter((f) => simplifySlug(f.slug!) !== slug && f.slug !== "index")
      .map((f) => {
        const shared = (f.frontmatter?.tags ?? []).filter((t) => tags.has(t)).length
        return { f, shared }
      })
      .filter(({ shared }) => shared > 0)
      .sort((a, b) => b.shared - a.shared)
      .slice(0, opts.limit)

    if (scored.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "related-notes")}>
        <h3>You might also like</h3>
        <ul>
          {scored.map(({ f }) => (
            <li>
              <a href={resolveRelative(fileData.slug!, f.slug!)} class="internal">
                {f.frontmatter?.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  RelatedNotes.css = style
  return RelatedNotes
}) satisfies QuartzComponentConstructor
