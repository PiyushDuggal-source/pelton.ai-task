import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Project } from "../types/api";
import { Link, useNavigate } from "react-router-dom";
import {
  getProjects,
  createProject,
  joinProject,
  createProjectSchema,
  type CreateProjectInput,
  joinProjectSchema,
  type JoinProjectInput,
} from "../features/projects/projects";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Users, LogOut } from "lucide-react"; // icons

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    setValue: setValueCreate,
    watch: watchCreate,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  });

  const {
    register: registerJoin,
    handleSubmit: handleSubmitJoin,
    formState: { errors: errorsJoin },
  } = useForm<JoinProjectInput>({
    resolver: zodResolver(joinProjectSchema),
  });

  const deadlineWatch = watchCreate("deadline");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const onCreateSubmit = async (data: CreateProjectInput) => {
    try {
      const newProject = await createProject(data);
      setProjects((prev) => [...prev, newProject]);
      toast.success("✅ Project created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "❌ Failed to create project");
    }
  };

  const onJoinSubmit = async (data: JoinProjectInput) => {
    try {
      const joinedProject = await joinProject(data);
      setProjects((prev) => [...prev, joinedProject]);
      toast.success("✅ Joined project successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "❌ Failed to join project");
    }
  };

  if (loading)
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );

  if (error) navigate("/login");

  return (
    <div className="container mx-auto p-6 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage your projects or join with an invite code
          </p>
        </div>
        <button 
          onClick={logout}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Project */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border-t-4 border-indigo-600">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-indigo-700">
              Create New Project
            </h2>
          </div>
          <form
            onSubmit={handleSubmitCreate(onCreateSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                {...registerCreate("name")}
              />
              {errorsCreate.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errorsCreate.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                {...registerCreate("description")}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deadline (Optional)
              </label>
              <DatePicker
                selected={deadlineWatch ? new Date(deadlineWatch) : null}
                onChange={(date: Date | null) =>
                  setValueCreate("deadline", date ? date.toISOString() : null)
                }
                showTimeSelect
                dateFormat="Pp"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
              />
              {errorsCreate.deadline && (
                <p className="mt-1 text-sm text-red-600">
                  {errorsCreate.deadline.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Create Project
            </button>
          </form>
        </div>

        {/* Join Project */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border-t-4 border-green-600">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-green-600" />
            <h2 className="text-lg font-semibold text-green-700">
              Join Project
            </h2>
          </div>
          <form onSubmit={handleSubmitJoin(onJoinSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Invite Code
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 text-black"
                {...registerJoin("inviteCode")}
              />
              {errorsJoin.inviteCode && (
                <p className="mt-1 text-sm text-red-600">
                  {errorsJoin.inviteCode.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Join Project
            </button>
          </form>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Your Projects
        </h2>
        {projects.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-2">No projects yet 📭</p>
            <p className="text-sm">
              Create one above or join with an invite code!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link to={`/projects/${project._id}`} key={project._id}>
                <div className="p-5 border rounded-lg shadow-sm hover:shadow-md transition bg-gray-50 cursor-pointer h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-700">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="mt-4 text-xs text-gray-500 space-y-1">
                    {project.deadline && (
                      <p>📅 Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                    )}
                    <p>🔑 Invite Code: {project.inviteCode}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

