
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, TrashIcon, CheckCircleIcon, CircleIcon } from 'lucide-react';
import { InvoiceTask } from '@/types/invoice';

interface TasksSectionProps {
  tasks: InvoiceTask[];
  onTasksChange: (tasks: InvoiceTask[]) => void;
}

const TasksSection: React.FC<TasksSectionProps> = ({ tasks, onTasksChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const addTask = () => {
    if (!newTaskDescription.trim()) return;

    const newTask: InvoiceTask = {
      id: Date.now().toString(),
      description: newTaskDescription,
      completed: false
    };

    onTasksChange([...tasks, newTask]);
    setNewTaskDescription('');
    setShowAddForm(false);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined
        };
      }
      return task;
    });
    onTasksChange(updatedTasks);
  };

  const removeTask = (taskId: string) => {
    onTasksChange(tasks.filter(task => task.id !== taskId));
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h4 className="font-medium">Task Checklist</h4>
          {totalTasks > 0 && (
            <Badge variant={completedTasks === totalTasks ? "default" : "secondary"}>
              {completedTasks}/{totalTasks} Complete
            </Badge>
          )}
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
          />
        </div>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-white">
          <h5 className="font-medium">Add New Task</h5>
          <div>
            <Label>Task Description</Label>
            <Input
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Enter task description"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={addTask} size="sm">Add Task</Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No tasks added yet. Create tasks to track invoice progress.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`border rounded-lg p-3 flex items-center gap-3 ${
                  task.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <CircleIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <span className={task.completed ? 'line-through text-gray-600' : ''}>
                    {task.description}
                  </span>
                  {task.completed && task.completedAt && (
                    <div className="text-xs text-green-600 mt-1">
                      Completed on {new Date(task.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => removeTask(task.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksSection;
