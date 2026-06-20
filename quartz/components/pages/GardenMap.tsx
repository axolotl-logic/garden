import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import GraphConstructor from "../Graph"
import { concatenateResources } from "../../util/resources"
// @ts-ignore
import style from "../styles/gardenMap.scss"

export default (() => {
  // render the whole garden: depth -1 pulls in every node regardless of current slug
  const Graph = GraphConstructor({
    localGraph: {
      depth: -1,
      scale: 0.9,
      repelForce: 0.5,
      centerForce: 0.3,
      linkDistance: 30,
      fontSize: 0.6,
      enableRadial: true,
    },
  })

  const GardenMap: QuartzComponent = (props: QuartzComponentProps) => {
    return (
      <div class="garden-map">
        <Graph {...props} />
      </div>
    )
  }

  GardenMap.css = concatenateResources(style, Graph.css)
  GardenMap.beforeDOMLoaded = Graph.beforeDOMLoaded
  GardenMap.afterDOMLoaded = Graph.afterDOMLoaded
  return GardenMap
}) satisfies QuartzComponentConstructor
