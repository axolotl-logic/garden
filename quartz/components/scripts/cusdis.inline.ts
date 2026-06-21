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

// Registered once at module load. Cusdis sends postMessage data as a JSON string,
// so we parse it here. Querying the DOM each time ensures we always target the
// live iframe even after CUSDIS.initial() replaces it on SPA navigation.
window.addEventListener("message", (event) => {
  let msg: Record<string, unknown>
  try {
    msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data
    if (typeof msg !== "object" || msg === null) return
  } catch {
    return
  }
  // [cusdis-debug] log every cusdis-origin message we receive
  if (msg.from === "cusdis") {
    // eslint-disable-next-line no-console
    console.log("[cusdis-debug] message received:", msg.event, "data:", msg.data)
  }
  if (msg.from !== "cusdis" || msg.event !== "resize") return
  const iframe = document.querySelector<HTMLIFrameElement>("#cusdis_thread iframe")
  // eslint-disable-next-line no-console
  console.log("[cusdis-debug] resize -> iframe found:", !!iframe, "height:", msg.data)
  if (iframe) {
    const h = Number(msg.data)
    if (h > 0) iframe.style.height = `${h}px`
  }
})

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
