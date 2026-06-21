import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import script from "./scripts/cusdis.inline"

type Options = {
  host?: string
  appId: string
}

export default ((opts: Options) => {
  const Cusdis: QuartzComponent = ({ displayClass, fileData, cfg }: QuartzComponentProps) => {
    const host = opts.host ?? "https://cusdis.com"
    const slug = fileData.slug!
    const pageUrl = `https://${cfg.baseUrl ?? "example.com"}/${slug}`
    const pageTitle = fileData.frontmatter?.title ?? slug

    return (
      <div
        id="cusdis_thread"
        class={classNames(displayClass, "cusdis")}
        data-host={host}
        data-app-id={opts.appId}
        data-page-id={slug}
        data-page-url={pageUrl}
        data-page-title={pageTitle}
      ></div>
    )
  }

  Cusdis.afterDOMLoaded = script

  return Cusdis
}) satisfies QuartzComponentConstructor<Options>
