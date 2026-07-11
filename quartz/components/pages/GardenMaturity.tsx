import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { PageList, byOutgoingLinks } from "../PageList"
import style from "../styles/listPage.scss"
import { concatenateResources } from "../../util/resources"

// growth buckets in maturity order, with label-only headings
const buckets: { key: string; label: string }[] = [
  { key: "seedling", label: "🌱 Seedling" },
  { key: "budding", label: "🌿 Budding" },
  { key: "evergreen", label: "🌲 Evergreen" },
]

export default (() => {
  const GardenMaturity: QuartzComponent = (props: QuartzComponentProps) => {
    const { cfg, allFiles } = props
    return (
      <div class="popover-hint">
        {buckets.map(({ key, label }) => {
          const pages = allFiles.filter(
            (f) => (f.frontmatter?.growth as string | undefined)?.toLowerCase() === key,
          )
          if (pages.length === 0) {
            return null
          }
          const listProps = { ...props, allFiles: pages }
          return (
            <div class="page-listing">
              <h2>{label}</h2>
              <PageList sort={byOutgoingLinks(cfg)} {...listProps} />
            </div>
          )
        })}
      </div>
    )
  }

  GardenMaturity.css = concatenateResources(style, PageList.css)
  return GardenMaturity
}) satisfies QuartzComponentConstructor
