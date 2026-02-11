"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Award,
  Mail,
  Globe,
  TrendingUp,
  Save,
  RefreshCw,
  Search,
} from "lucide-react";

export default function EnrolledStudents({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMarks, setEditingMarks] = useState({});
  const [savingMarks, setSavingMarks] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}/students`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data.students);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, value) => {
    setEditingMarks((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveMarks = async (studentId, currentMarks) => {
    const newMarks = editingMarks[studentId];

    if (newMarks === undefined || newMarks === "") {
      return;
    }

    const marks = parseInt(newMarks, 10);

    if (isNaN(marks) || marks < 0 || marks > 100) {
      alert("Marks must be a number between 0 and 100");
      return;
    }

    setSavingMarks((prev) => ({ ...prev, [studentId]: true }));

    try {
      const response = await fetch(`/api/courses/${courseId}/students`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          marks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update marks");
      }

      // Update local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId ? { ...student, marks } : student,
        ),
      );

      // Clear editing state
      setEditingMarks((prev) => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });

      alert("Marks updated successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingMarks((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={24} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p className="font-bold">Error loading students</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchStudents}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-slate-500">
          {filteredStudents.length}{" "}
          {filteredStudents.length === 1 ? "student" : "students"}
          {searchQuery && ` found (${students.length} total)`}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="font-bold">
            {searchQuery ? "No students found" : "No students enrolled yet"}
          </p>
          <p className="text-sm mt-1">
            {searchQuery
              ? "Try a different search term."
              : "Students will appear here once they enroll in this course."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-50 rounded-2xl border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Student
                </th>
                <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Country
                </th>
                <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Skill Level
                </th>
                <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Marks
                </th>
                <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const isEditing = editingMarks[student.id] !== undefined;
                const isSaving = savingMarks[student.id];

                return (
                  <tr
                    key={student.id}
                    className="bg-white border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {student.name}
                          </p>
                          {student.age && (
                            <p className="text-xs text-slate-500">
                              {student.age} years old
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} />
                        {student.email}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Globe size={14} />
                        {student.country || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <TrendingUp size={14} />
                        {student.skill_level || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingMarks[student.id]}
                            onChange={(e) =>
                              handleMarksChange(student.id, e.target.value)
                            }
                            className="w-20 px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isSaving}
                          />
                        ) : (
                          <div
                            onClick={() =>
                              handleMarksChange(student.id, student.marks ?? "")
                            }
                            className="cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            {student.marks !== null &&
                            student.marks !== undefined ? (
                              <div className="flex items-center gap-2">
                                <Award size={16} className="text-indigo-500" />
                                <span className="font-bold text-slate-900">
                                  {student.marks}/100
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-medium">
                                Not graded
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {isEditing && (
                        <button
                          onClick={() =>
                            handleSaveMarks(student.id, student.marks)
                          }
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={14} />
                              Save
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
