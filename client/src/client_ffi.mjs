import ELK from "elkjs";
import { NodeLayout$NodeLayout, NodeLayout$NodeLayout$id, NodeLayout$NodeLayout$label, EdgeLayout$EdgeLayout$from, EdgeLayout$EdgeLayout$to } from '../shared/shared/layout.mjs';
import { Option$Some, Option$None, Option$isSome, Option$Some$0 } from '../gleam_stdlib/gleam/option.mjs';

const elk = new ELK();

const DEFAULT_LAYOUT_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.edgeRouting": "POLYLINE",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.spacing.nodeNodeBtweenLayers": "20",
};

const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 40;

const DEFAULT_LABEL_WIDTH = 80;
const DEFAULT_LABEL_HEIGHT = 15;

/**
 * Compute a layered graph layout from a flat list of nodes and edges.
 *
 * The first element of `nodes` is pinned to the topmost layer.
 *
 * @param {Array<{id: string, labels?: Array<{text: string}>, data?: object}>} nodes
 * @param {Array<{id: string, source: string, target: string, data?: object}>} edges
 * @returns {Promise<object>} The elkjs layout result with x/y on every node.
 */
export async function get_elk_layout(nodes, edges) {
  const children = nodes.map((node, index) => {

    const node_optional_label = NodeLayout$NodeLayout$label(node)
    const node_id = NodeLayout$NodeLayout$id(node)

    let labels = []

    if (Option$isSome(node_optional_label)) {
        labels = [{text: Option$Some$0(node_optional_label)}]
    }

    const elk_node = { id: node_id, labels: labels}

    // --- Node preprocessing goes here ---

    labels = (labels || []).map((label) => ({
      width: DEFAULT_LABEL_WIDTH,
      height: DEFAULT_LABEL_HEIGHT,
      ...label,
    }));

    return {
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
      ...elk_node,
      labels,
      layoutOptions: {
        ...(index === 0
          ? { "elk.layered.layering.layerConstraint": "FIRST" }
          : {}),
        ...elk_node.layoutOptions,
      },
    };
  });

  const elkEdges = edges.map((edge) => {

    const elk_edge = {source: EdgeLayout$EdgeLayout$from(edge), target: EdgeLayout$EdgeLayout$to(edge)}

    // --- Edge preprocessing goes here ---

    return {
      id: `${elk_edge.source}__${elk_edge.target}`, 
      sources: [elk_edge.source],
      targets: [elk_edge.target],
      ...(elk_edge.data ? { data: elk_edge.data } : {}),
    };
  });

  const graph = {
    id: "root",
    layoutOptions: DEFAULT_LAYOUT_OPTIONS,
    children,
    edges: elkEdges,
  };

  const layout = await elk.layout(graph);

  return layout.children.map((elk_node, index) => {
    let label = Option$None()
    if (elk_node.labels.length >= 1) {
        label = Option$Some(elk_node.labels[0].text)
    }
    return NodeLayout$NodeLayout(elk_node.id, label, elk_node.x, elk_node.y)
  })
}