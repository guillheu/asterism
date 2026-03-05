import asterism/internal/lustre/model.{type Model, Model}
import asterism/internal/lustre/update.{type Msg}
import asterism/internal/lustre/view
import asterism/internal/process_tree
import gleam/int
import gleam/list
import gleam/string
import lustre
import lustre/effect.{type Effect}

pub type Grid {
  Grid(cols: Int, col_w: Int, row_h: Int)
}

pub fn app() -> lustre.App(Nil, Model, Msg) {
  lustre.application(init, update.update, view.view)
}

fn init(_: Nil) -> #(Model, Effect(Msg)) {
  let #(processes, links) = process_tree.get_process_tree()

  let curried = fn(proc, index) { process_to_node_indexed(proc, index) }
  let nodes =
    list.sort(processes, fn(p1, p2) {
      let assert Ok(pid_int1) =
        string.inspect(p1.pid)
        |> string.drop_start(9)
        |> string.drop_end(4)
        |> int.parse
      let assert Ok(pid_int2) =
        string.inspect(p2.pid)
        |> string.drop_start(9)
        |> string.drop_end(4)
        |> int.parse
      int.compare(pid_int1, pid_int2)
    })
    |> list.index_map(curried)

  let edges =
    list.map(links, fn(link) {
      let node_id_1 = model.pid_to_node_id(link.pid_1)
      let node_id_2 = model.pid_to_node_id(link.pid_2)
      model.Edge(
        id: node_id_1 <> "<>" <> node_id_2,
        link:,
        node_id_1:,
        node_id_2:,
      )
    })
  #(Model(nodes, edges), effect.none())
}

fn process_to_node_indexed(
  process: process_tree.Process,
  index: Int,
) -> model.Node {
  model.Node(
    process:,
    id: "node-" <> int.to_string(index),
    label: process_tree.process_to_string(process),
    x: int.to_float({ index % 10 } * 100),
    y: int.to_float({ index / 10 } * 100),
  )
}
