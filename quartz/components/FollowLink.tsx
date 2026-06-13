import { resolveRelative, FullSlug } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

// Unobtrusive sidebar link to the /follow mailing-list signup page.
const FollowLink: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const href = resolveRelative(fileData.slug!, "follow" as FullSlug)
  return (
    <a href={href} class={classNames(displayClass, "follow-link")}>
      Follow Changes
    </a>
  )
}

FollowLink.css = `
.follow-link {
  display: inline-block;
  font-size: 0.9rem;
}
`

export default (() => FollowLink) satisfies QuartzComponentConstructor
