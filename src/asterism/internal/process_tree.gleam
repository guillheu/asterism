import gleam/list

pub type Id =
  Int

pub type DisplayFunction(display_type) =
  fn(Id, Int, Int, Int) -> display_type

// Pid, depth of the node, index of the node, parent index

pub type Process {
  Process(pid: Id, workers: List(Process))
}

pub fn display(
  start: Process,
  display_function: DisplayFunction(display_type),
) -> List(display_type) {
  display_recurse([#(start, 0, 0)], display_function, 0, []) |> list.reverse
}

fn display_recurse(
  worklist: List(#(Process, Int, Int)),
  display_fn: DisplayFunction(display_type),
  current_index: Int,
  acc: List(display_type),
) -> List(display_type) {
  case worklist {
    [work, ..rest] -> {
      let #(process, depth, parent_index) = work
      let amount_children = case process.workers {
        [] -> 0
        [_] -> 1
        [_, _] -> 2
        [_, _, _] -> 3
        [_, _, _, _] -> 4
        [_, _, _, _, _] -> 5
        [_, _, _, _, _, _] -> 6
        [_, _, _, _, _, _, _] -> 7
        [_, _, _, _, _, _, _, _] -> 8
        [_, _, _, _, _, _, _, _, _] -> 9

        _ -> list.length(process.workers)
      }
      let process_display =
        display_fn(process.pid, depth, current_index, parent_index)
      let new_acc = [process_display, ..acc]
      case process.workers {
        [] -> display_recurse(rest, display_fn, current_index + 1, new_acc)
        process_workers ->
          list.map(process_workers, fn(worker) {
            #(worker, depth + 1, current_index)
          })
          |> list.append(rest)
          |> display_recurse(display_fn, current_index + 1, new_acc)
      }
    }
    [] -> acc
  }
}
