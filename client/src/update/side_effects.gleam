import lustre/effect.{type Effect}
import shared/update/types.{
  type GraphData, type Msg, EdgeData, GraphData, NodeData,
  ServerInitializedGraph,
}

// After we migrate, this side effect should instead just listen on a websocket to the server
// aaaaaaall this compute should be server-side, the client should know nothing of the process_tree

pub fn init() -> Effect(Msg) {
  effect.from(fn(dispatch) {
    todo as "implement stratus WS client"
    |> ServerInitializedGraph
    |> dispatch
  })
}
