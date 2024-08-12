"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/ui/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import _ from 'lodash';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Todo {
  id: string;
  text: string;
  created_at: string;
  user: 'PRANAV' | 'DINESH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export default function TodoPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedUser, setSelectedUser] = useState<'PRANAV' | 'DINESH'>('PRANAV');
  const [selectedStatus, setSelectedStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  useEffect(() => {
    if (isDevMode) {
      fetchTodos();
    } else {
      router.push("/")
    }
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data || []);
    }
  }

  async function addTodo() {
    if (!newTodo.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert({ text: newTodo, user: selectedUser, status: selectedStatus })
      .select();

    if (error) {
      console.error('Error adding todo:', error);
    } else if (data) {
      setTodos([data[0], ...todos]);
      setNewTodo('');
    }
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
    } else {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  }

  async function updateTodoStatus(id: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') {
    const { error } = await supabase
      .from('todos')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo status:', error);
    } else {
      setTodos(todos.map(todo => todo.id === id ? { ...todo, status: newStatus } : todo));
    }
  }

  async function updateTodoUser(id: string, newUser: 'PRANAV' | 'DINESH') {
    const { error } = await supabase
      .from('todos')
      .update({ user: newUser })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo user:', error);
    } else {
      setTodos(todos.map(todo => todo.id === id ? { ...todo, user: newUser } : todo));
    }
  }

  const statusGroups = {
    TODO: todos.filter(todo => todo.status === 'TODO'),
    IN_PROGRESS: todos.filter(todo => todo.status === 'IN_PROGRESS'),
    DONE: todos.filter(todo => todo.status === 'DONE'),
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Developer Todo List</h1>
          <div className="flex mb-4">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new feature or task..."
              className="flex-grow mr-2"
            />
            <Select value={selectedUser} onValueChange={(value: 'PRANAV' | 'DINESH') => setSelectedUser(value)}>
              <SelectTrigger className="w-[180px] mr-2">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRANAV">PRANAV</SelectItem>
                <SelectItem value="DINESH">DINESH</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={(value: 'TODO' | 'IN_PROGRESS' | 'DONE') => setSelectedStatus(value)}>
              <SelectTrigger className="w-[180px] mr-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">TODO</SelectItem>
                <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                <SelectItem value="DONE">DONE</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTodo}>Add Todo</Button>
          </div>
          <div className="space-y-8">
          {Object.entries(statusGroups).map(([status, todos]) => (
              <div key={status}>
                <h2 className="text-lg font-medium mb-4 text-gray-700">
                  {_.startCase(_.toLower(status))}
                </h2>
                <div className="space-y-4">
                  {todos.length > 0 ? (
                    todos.map((todo) => (
                      <Card key={todo.id}>
                        <CardContent className="flex justify-between items-center p-4">
                          <div className="flex flex-col">
                            <div className="flex flex-col space-y-2">
                              <div>{todo.text}</div>
                              <div className="text-sm text-gray-500">
                                Created: {new Date(todo.created_at).toLocaleString()}
                              </div>
                              <div className="text-sm font-medium text-gray-800 mb-2">
                                Assigned to:
                                <Badge
                                  className={`cursor-pointer ml-2 ${todo.user === 'PRANAV' ? 'bg-pink-400' : 'bg-gray-200 text-gray-500'}`}
                                  onClick={() => updateTodoUser(todo.id, 'PRANAV')}
                                >
                                  PRANAV
                                </Badge>
                                <Badge
                                  className={`cursor-pointer ml-2 ${todo.user === 'DINESH' ? 'bg-orange-500' : 'bg-gray-200 text-gray-500'}`}
                                  onClick={() => updateTodoUser(todo.id, 'DINESH')}
                                >
                                  DINESH
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-4">
                              <Badge
                                className={`cursor-pointer ${todo.status === 'TODO' ? 'bg-yellow-500' : 'bg-gray-200 text-gray-500'}`}
                                onClick={() => updateTodoStatus(todo.id, 'TODO')}
                              >
                                TODO
                              </Badge>
                              <Badge
                                className={`cursor-pointer ${todo.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-200 text-gray-500'}`}
                                onClick={() => updateTodoStatus(todo.id, 'IN_PROGRESS')}
                              >
                                IN PROGRESS
                              </Badge>
                              <Badge
                                className={`cursor-pointer ${todo.status === 'DONE' ? 'bg-green-500' : 'bg-gray-200 text-gray-500'}`}
                                onClick={() => updateTodoStatus(todo.id, 'DONE')}
                              >
                                DONE
                              </Badge>
                            </div>
                          </div>
                          <Button variant="destructive" onClick={() => deleteTodo(todo.id)}>
                            Delete
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-gray-50 border border-dashed border-gray-300">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-gray-500">
                        <PlusCircle className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">No tasks in this status</p>
                        <p className="text-xs mt-1">Add a new task or move one here</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}