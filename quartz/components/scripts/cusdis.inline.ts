type CusdisGlobal = {
  initial: () => void
  setTheme: (theme: "light" | "dark" | "auto") => void
}

declare global {
  interface Window {
    CUSDIS?: CusdisGlobal
    cusdisLoaded?: boolean
  }
}

const CUSDIS_SRC = "https://cusdis.com/js/cusdis.es.js"

const resolveTheme = (saved: string | null): "light" | "dark" =>
  saved === "dark" ? "dark" : "light"

const applyTheme = (e: CustomEventMap["themechange"]) => {
  window.CUSDIS?.setTheme(e.detail.theme === "dark" ? "dark" : "light")
}

document.addEventListener("nav", () => {
  const thread = document.querySelector("#cusdis_thread")
  if (!thread) {
    return
  }

  // reflect current site theme into the embed before it renders
  thread.setAttribute(
    "data-theme",
    resolveTheme(document.documentElement.getAttribute("saved-theme")),
  )

  if (window.cusdisLoaded) {
    // script already present (e.g. returning to a page) — just re-render
    window.CUSDIS?.initial()
  } else {
    const cusdisScript = document.createElement("script")
    cusdisScript.src = CUSDIS_SRC
    cusdisScript.async = true
    cusdisScript.defer = true
    document.body.appendChild(cusdisScript)
    window.cusdisLoaded = true
  }

  document.addEventListener("themechange", applyTheme)
  window.addCleanup(() => document.removeEventListener("themechange", applyTheme))
})
