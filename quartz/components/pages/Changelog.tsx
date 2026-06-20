import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { PageList, byDateAndAlphabetical } from "../PageList"
import style from "../styles/listPage.scss"
import { concatenateResources } from "../../util/resources"

interface Options {
  limit: number
}

const defaultOptions: Options = {
  limit: 30,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Changelog: QuartzComponent = (props: QuartzComponentProps) => {
    const { cfg, allFiles } = props
    // most-recently-tended notes first; drop the home page and tag listing pages
    const pages = allFiles.filter((f) => f.slug !== "index" && !f.slug!.startsWith("tags/"))
    const listProps = { ...props, allFiles: pages }
    return (
      <div class="popover-hint">
        <div class="page-listing">
          <PageList limit={opts.limit} sort={byDateAndAlphabetical(cfg)} {...listProps} />
        </div>
      </div>
    )
  }

  Changelog.css = concatenateResources(style, PageList.css)
  return Changelog
}) satisfies QuartzComponentConstructor
