// Fires an analytics conversion event when a visitor submits the mailing-list
// signup. The Zoho form posts to a cross-origin target, so the click on the
// Subscribe button is the reliable signal we can observe.
const EVENT_NAME = "Mailing List Signup"

function trackSignup() {
  // Plausible (the provider configured for this site).
  const plausible = (window as any).plausible
  if (typeof plausible === "function") {
    plausible(EVENT_NAME, { props: { method: "zoho", page: "/follow" } })
  }
  // Google Analytics (gtag), if present.
  const gtag = (window as any).gtag
  if (typeof gtag === "function") {
    gtag("event", "sign_up", { method: "mailing_list" })
  }
}

document.addEventListener("nav", () => {
  const button = document.querySelector<HTMLElement>("#zcWebOptin")
  if (!button || button.dataset.signupTracked === "true") return
  button.dataset.signupTracked = "true"
  button.addEventListener("click", trackSignup)
})
