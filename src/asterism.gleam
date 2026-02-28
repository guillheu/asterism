import gleam/list

pub type Id =
  Int

pub type DisplayFunction(display_type) =
  fn(Id, Int) -> display_type

// Pid, depth of the node, number of children

pub type Process {
  Process(pid: Id, workers: List(Process))
}

pub fn display(
  start: Process,
  display_function: DisplayFunction(display_type),
) -> List(display_type) {
  display_recurse([#(start, 0)], display_function, []) |> list.reverse
}

fn display_recurse(
  worklist: List(#(Process, Int)),
  display_fn: DisplayFunction(display_type),
  acc: List(display_type),
) -> List(display_type) {
  case worklist {
    [work, ..rest] -> {
      let #(process, depth) = work
      let process_display = display_fn(process.pid, depth)
      let new_acc = [process_display, ..acc]
      case process.workers {
        [] -> display_recurse(rest, display_fn, new_acc)
        process_workers ->
          list.map(process_workers, fn(worker) { #(worker, depth + 1) })
          |> list.append(rest)
          |> display_recurse(display_fn, new_acc)
      }
    }
    [] -> acc
  }
}
