import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import script from "./scripts/randomNote.inline"
import style from "./styles/randomNote.scss"

export default (() => {
  const RandomNote: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <button class={classNames(displayClass, "random-note")} type="button" title="Random note">
        Random note
      </button>
    )
  }

  RandomNote.css = style
  RandomNote.afterDOMLoaded = script
  return RandomNote
}) satisfies QuartzComponentConstructor
