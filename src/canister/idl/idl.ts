export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Time = IDL.Int;
  const Todo = IDL.Record({
    id: IDL.Nat,
    owner: IDL.Principal,
    desc: IDL.Text,
    done: IDL.Bool,
    created_at: Time,
    completed_at: IDL.Opt(Time),
  });
  const User = IDL.Record({
    todos: IDL.Vec(Todo),
    username: IDL.Text,
    password: IDL.Text,
  });
  const TodoApp = IDL.Service({
    getUsers: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Principal, User))],
      ['query'],
    ),
    listTodos: IDL.Func([], [IDL.Vec(Todo)], ['query']),
    markDone: IDL.Func([IDL.Nat], [IDL.Opt(Todo)], []),
    newTodo: IDL.Func([IDL.Text, IDL.Bool], [IDL.Opt(Todo)], []),
    nextTid: IDL.Func([], [IDL.Nat], []),
    register: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(User)], []),
  });
  return TodoApp;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const init = ({}) => {
  return [];
};
