import asterism/internal/lustre/model.{type Model, Model}
import asterism/internal/lustre/update.{type Msg}
import asterism/internal/lustre/view
import asterism/internal/process_tree
import gleam/int
import gleam/list
import lustre
import lustre/effect.{type Effect}

pub type Grid {
  Grid(cols: Int, col_w: Int, row_h: Int)
}

pub fn app() -> lustre.App(Grid, Model, Msg) {
  lustre.application(init, update.update, view.view)
}

fn init(grid: Grid) -> #(Model, Effect(Msg)) {
  let #(processes, links) = process_tree.get_process_tree()

  let curried = fn(proc, index) { process_to_node_indexed(proc, index, grid) }
  let nodes = list.index_map(processes, curried)
  let edges = list.map(links, model.Edge)
  #(Model(nodes, edges), effect.none())
}

fn process_to_node_indexed(
  process: process_tree.Process,
  index: Int,
  grid: Grid,
) -> model.Node {
  model.Node(
    process:,
    id: "node-" <> int.to_string(index),
    label: process_tree.process_to_string(process),
    x: int.to_float({ index % grid.cols } * grid.row_h),
    y: int.to_float({ index / grid.cols } * grid.col_w),
  )
}
