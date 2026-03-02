import gleam/erlang/atom.{type Atom}
import gleam/erlang/process.{type Pid}
import gleam/list
import gleam/option.{type Option, None, Some}

pub type ProcessTree {
  ProcessNode(process: Process, workers: List(ProcessTree))
}

pub type Process {
  Process(pid: Pid, name: Option(String))
}

pub type DisplayFunction(display_type) =
  fn(Process, Int, Int, Int) -> display_type

// Process, depth, index, parent index

pub fn display(
  start: ProcessTree,
  display_function: DisplayFunction(display_type),
) -> List(display_type) {
  display_recurse([#(start, 0, 0)], display_function, 0, []) |> list.reverse
}

fn display_recurse(
  worklist: List(#(ProcessTree, Int, Int)),
  display_fn: DisplayFunction(display_type),
  current_index: Int,
  acc: List(display_type),
) -> List(display_type) {
  case worklist {
    [work, ..rest] -> {
      let #(process_node, depth, parent_index) = work
      let process_display =
        display_fn(
          Process(process_node.process.pid, process_node.process.name),
          depth,
          current_index,
          parent_index,
        )
      let new_acc = [process_display, ..acc]
      case process_node.workers {
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

pub fn get_process_tree() -> ProcessTree {
  let root_process =
    get_root_process()
    |> pid_to_process
  let linked =
    get_linked_processes(root_process)
    |> list.map(fn(process_node) {
      let grandkids_ish =
        get_linked_processes(process_node.process)
        |> list.filter(fn(process_node) {
          process_node.process.name != Some("init")
        })
      ProcessNode(..process_node, workers: grandkids_ish)
    })
  ProcessNode(root_process, linked)
}

fn pid_to_process(pid: Pid) -> Process {
  let name = get_process_name(pid) |> option.map(atom.to_string)
  Process(pid, name)
}

fn get_linked_processes(process: Process) -> List(ProcessTree) {
  get_linked_pids(process.pid)
  |> list.map(fn(pid) { pid_to_process(pid) |> ProcessNode([]) })
}

@external(erlang, "asterism_ffi", "get_root_process")
fn get_root_process() -> Pid

@external(erlang, "asterism_ffi", "get_children")
fn get_children_processes(parent: Pid) -> List(Pid)

@external(erlang, "asterism_ffi", "get_linked_pids")
fn get_linked_pids(from: Pid) -> List(Pid)

@external(erlang, "asterism_ffi", "get_process_name")
fn get_process_name(from: Pid) -> Option(Atom)
