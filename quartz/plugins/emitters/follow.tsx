import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { FullSlug, pathToRoot } from "../../util/path"
import { defaultContentPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { ArticleTitle, FollowChanges } from "../../components"
import { defaultProcessedContent } from "../vfile"
import { write } from "./helpers"

// Emits a standalone /follow page (the mailing-list signup) that is not backed
// by a markdown file in content/. Modeled on the built-in NotFoundPage emitter,
// it reuses the normal left sidebar so navigation stays consistent.
export const FollowPage: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultContentPageLayout,
    pageBody: FollowChanges(),
    beforeBody: [ArticleTitle()],
    right: [],
  }

  const { head: Head, pageBody, footer: Footer, left, beforeBody, afterBody } = opts
  const Body = BodyConstructor()

  return {
    name: "FollowPage",
    getQuartzComponents() {
      return [Head, Body, ...beforeBody, pageBody, ...afterBody, ...left, Footer]
    },
    async *emit(ctx, content, resources) {
      const cfg = ctx.cfg.configuration
      const slug = "follow" as FullSlug
      const title = "Follow Changes"

      const [tree, vfile] = defaultProcessedContent({
        slug,
        text: title,
        description: "Subscribe to get notified when this garden grows new notes.",
        frontmatter: { title, tags: [] },
      })

      const externalResources = pageResources(pathToRoot(slug), resources)
      const componentData: QuartzComponentProps = {
        ctx,
        fileData: vfile.data,
        externalResources,
        cfg,
        children: [],
        tree,
        allFiles: content.map((c) => c[1].data),
      }

      yield write({
        ctx,
        content: renderPage(cfg, slug, componentData, opts, externalResources),
        slug,
        ext: ".html",
      })
    },
    async *partialEmit() {},
  }
}
