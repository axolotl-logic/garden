import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FullSlug, pathToRoot } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { Changelog, GardenMaturity, GardenMap, RecentNotes } from "../../components"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { StaticResources } from "../../util/resources"
import { QuartzComponent } from "../../components/types"

// synthetic index pages generated without any content/ files
const pages: { slug: FullSlug; title: string; pageBody: QuartzComponent }[] = [
  {
    slug: "recently-tended" as FullSlug,
    title: "Recently tended",
    pageBody: RecentNotes({
      title: "",
      limit: 50,
      filter: (f) => f.slug !== "index" && !f.slug!.startsWith("tags/"),
    }),
  },
  { slug: "changelog" as FullSlug, title: "What's new", pageBody: Changelog() },
  { slug: "garden" as FullSlug, title: "Garden", pageBody: GardenMaturity() },
  { slug: "garden-map" as FullSlug, title: "Garden map", pageBody: GardenMap() },
]

async function processPage(
  ctx: BuildCtx,
  slug: FullSlug,
  title: string,
  pageBody: QuartzComponent,
  allFiles: QuartzComponentProps["allFiles"],
  resources: StaticResources,
) {
  const cfg = ctx.cfg.configuration
  const [tree, file] = defaultProcessedContent({
    slug,
    frontmatter: { title, tags: [], comments: false },
  })
  const externalResources = pageResources(pathToRoot(slug), resources)
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody,
  }
  const componentData: QuartzComponentProps = {
    ctx,
    fileData: file.data,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }
  const content = renderPage(cfg, slug, componentData, opts, externalResources)
  return write({ ctx, content, slug, ext: ".html" })
}

export const GardenPages: QuartzEmitterPlugin = () => {
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "GardenPages",
    getQuartzComponents() {
      const {
        head: Head,
        header,
        beforeBody,
        left,
        right,
        footer: Footer,
      } = {
        ...sharedPageComponents,
        ...defaultListPageLayout,
      }
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        ...pages.map((p) => p.pageBody),
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map((c) => c[1].data)
      for (const { slug, title, pageBody } of pages) {
        yield processPage(ctx, slug, title, pageBody, allFiles, resources)
      }
    },
  }
}
