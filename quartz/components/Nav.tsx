import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import style from "./styles/nav.scss"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Nav: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? {}
    return (
      <nav class={classNames(displayClass, "nav")}>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  Nav.css = style
  return Nav
}) satisfies QuartzComponentConstructor
