-module(asterism_ffi).
-export([get_init_process/0, get_children/1, get_linked_processes/1, get_process_name/1, get_all_processes/0, pid_to_int/1]).

get_init_process() ->
    whereis(init).

get_children(SupRef) ->
    supervisor:which_children(SupRef).

get_linked_processes(Pid) ->
    case process_info(Pid, links) of
        {links, Links} ->
            lists:filter(fun is_pid/1, Links);
        undefined ->
            error(badarg)
    end.

get_process_name(Pid) ->
    case process_info(Pid, registered_name) of
        []                      -> none;
        {registered_name, Name} -> {some, Name}
    end.

get_all_processes() ->
    erlang:processes().

pid_to_int(Pid) ->
    PidStr = erlang:pid_to_list(Pid),           % "<0.42.0>"
    [_, Id, _] = string:split(PidStr, ".", all), % ["<0", "42", "0>"]
    list_to_integer(Id).