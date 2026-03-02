import gleam/erlang/atom.{type Atom}
import gleam/erlang/process.{type Pid}
import gleam/list
import gleam/option.{type Option}

pub type DisplayFunction(display_type) =
  fn(Pid, Option(String), Int, Int, Int) -> display_type

// Pid, optional process name, depth of the node, index of the node, parent index

pub type Process {
  Process(pid: Pid, name: Option(String), workers: List(Process))
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
      let process_display =
        display_fn(
          process.pid,
          process.name,
          depth,
          current_index,
          parent_index,
        )
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

pub fn get_process_tree() -> Process {
  let root_pid = get_root_process()

  let children =
    get_linked_pids(root_pid)
    |> list.map(fn(process) {
      let children =
        get_linked_pids(process)
        |> list.filter_map(fn(child_pid) {
          case child_pid == root_pid {
            True -> Error(Nil)
            False ->
              Ok(
                Process(
                  child_pid,
                  get_process_name(child_pid)
                    |> option.map(atom.to_string),
                  [],
                ),
              )
          }
        })
      Process(
        process,
        get_process_name(process) |> option.map(atom.to_string),
        children,
      )
    })
  Process(
    root_pid,
    get_process_name(root_pid) |> option.map(atom.to_string),
    children,
  )
}

@external(erlang, "asterism_ffi", "get_root_process")
fn get_root_process() -> Pid

@external(erlang, "asterism_ffi", "get_children")
fn get_children_processes(parent: Pid) -> List(Pid)

@external(erlang, "asterism_ffi", "get_linked_pids")
fn get_linked_pids(from: Pid) -> List(Pid)

@external(erlang, "asterism_ffi", "get_process_name")
fn get_process_name(from: Pid) -> Option(Atom)
