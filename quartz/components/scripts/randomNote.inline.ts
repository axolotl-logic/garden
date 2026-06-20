import { FullSlug, getFullSlug, resolveRelative } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

const goToRandom = async () => {
  const data: Record<string, ContentDetails> = await fetchData
  const slugs = (Object.keys(data) as FullSlug[]).filter(
    (slug) => slug !== "index" && !slug.startsWith("tags/"),
  )
  if (slugs.length === 0) {
    return
  }
  const target = slugs[Math.floor(Math.random() * slugs.length)]
  window.location.href = resolveRelative(getFullSlug(window), target)
}

document.addEventListener("nav", () => {
  for (const btn of document.getElementsByClassName("random-note")) {
    btn.addEventListener("click", goToRandom)
    window.addCleanup(() => btn.removeEventListener("click", goToRandom))
  }
})
