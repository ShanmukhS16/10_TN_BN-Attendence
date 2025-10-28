import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export interface User {
  id: string;
  name: string;
  role: "admin" | "user";
  email: string;
}

export interface Student {
  id: string;
  name: string;
  rank: string;
  collegeId: string;
  regimentalNo?: string;
  attendancePercentage: number;
  total_classes: number;
  attended_classes: number;
  createdBy: string;
}

export interface College {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  present: boolean;
  markedBy: string;
  timestamp: number;
}

interface AuthContextType {
  user: User | null;
  students: Student[];
  colleges: College[];
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchData: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  addStudent: (
    student: Omit<
      Student,
      "id" | "attendancePercentage" | "createdBy" | "total_classes" | "attended_classes"
    >
  ) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addCollege: (college: Omit<College, "id">) => Promise<void>;
  updateCollege: (id: string, updates: Partial<College>) => Promise<void>;
  markAttendance: (
    studentId: string,
    date: string,
    present: boolean
  ) => Promise<void>;
  getStudentsByCollege: (collegeId: string) => Student[];
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getStudentAttendancePercentage: (studentId: string) => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ---------------- LOGIN / LOGOUT ----------------
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) return false;

    const { data: profile } = await supabase
      .from("users")
      .select("id, name, role, email")
      .eq("id", data.user.id)
      .single();

    if (profile) {
      setUser(profile as User);
      await fetchData();
      return true;
    }

    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ---------------- PASSWORD RESET ----------------
  const requestPasswordReset = async (email: string): Promise<string> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://10-tn-bn-attendence.vercel.app/reset-password",
    });
    return error ? `❌ ${error.message}` : "✅ Password reset link sent!";
  };

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    const [studentsRes, collegesRes, attendanceRes] = await Promise.all([
      supabase.from("students").select("*"),
      supabase.from("colleges").select("*"),
      supabase.from("attendance").select("*"),
    ]);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (collegesRes.data) setColleges(collegesRes.data);
    if (attendanceRes.data) setAttendanceRecords(attendanceRes.data);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("users")
          .select("id, name, role, email")
          .eq("id", userId)
          .single();

        if (profile) {
          setUser(profile as User);
          await fetchData();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // ---------------- STUDENT OPERATIONS ----------------
  const addStudent = async (
    studentData: Omit<
      Student,
      "id" | "attendancePercentage" | "createdBy" | "total_classes" | "attended_classes"
    >
  ) => {
    if (!user) return;

    const newStudent = {
      ...studentData,
      attendancePercentage: 0,
      total_classes: 0,
      attended_classes: 0,
      createdBy: user.id,
    };

    const { error } = await supabase.from("students").insert(newStudent);
    if (error) {
      console.error("❌ Failed to insert student:", error.message);
      return;
    }

    await fetchData();
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const { error } = await supabase.from("students").update(updates).eq("id", id);
    if (error) console.error("❌ Failed to update student:", error.message);
    await fetchData();
  };

  const deleteStudent = async (id: string) => {
    await supabase.from("students").delete().eq("id", id);
    await supabase.from("attendance").delete().eq("studentId", id);
    await fetchData();
  };

  // ---------------- COLLEGE OPERATIONS ----------------
  const addCollege = async (college: Omit<College, "id">) => {
    await supabase.from("colleges").insert(college);
    await fetchData();
  };

  const updateCollege = async (id: string, updates: Partial<College>) => {
    await supabase.from("colleges").update(updates).eq("id", id);
    await fetchData();
  };

  // ---------------- ATTENDANCE OPERATIONS ----------------
  const markAttendance = async (
    studentId: string,
    date: string,
    present: boolean
  ) => {
    try {
      const record = {
        studentId,
        date,
        present,
        markedBy: user?.id || "system",
        timestamp: Date.now(),
      };

      const existing = attendanceRecords.find(
        (r) => r.studentId === studentId && r.date === date
      );

      let response;
      if (existing) {
        response = await supabase
          .from("attendance")
          .update({
            present: record.present,
            markedBy: record.markedBy,
            timestamp: record.timestamp,
          })
          .eq("id", existing.id);
      } else {
        response = await supabase.from("attendance").insert(record);
      }

      if (response.error) throw response.error;

      // ✅ Update attendance record locally
      setAttendanceRecords((prev) => {
        const others = prev.filter(
          (a) => !(a.studentId === studentId && a.date === date)
        );
        return [...others, { ...record, id: existing?.id || Math.random().toString() }];
      });

      // ✅ Update attendance stats for student
      await updateStudentAttendanceStats(studentId);
    } catch (err) {
      console.error("⚠️ markAttendance failed:", err);
      throw err;
    }
  };

  const updateStudentAttendanceStats = async (studentId: string) => {
    try {
      const { data: studentRecords, error } = await supabase
        .from("attendance")
        .select("present")
        .eq("studentId", studentId);

      if (error) throw error;

      const total_classes = studentRecords?.length || 0;
      const attended_classes = studentRecords?.filter((r) => r.present).length || 0;
      const percentage = total_classes
        ? Math.round((attended_classes / total_classes) * 100)
        : 0;

      const { error: updateErr } = await supabase
        .from("students")
        .update({
          total_classes,
          attended_classes,
          attendancePercentage: percentage,
        })
        .eq("id", studentId);

      if (updateErr) throw updateErr;

      // ✅ Reflect locally
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, total_classes, attended_classes, attendancePercentage: percentage }
            : s
        )
      );

      console.log(`📊 Updated ${studentId} → ${attended_classes}/${total_classes} (${percentage}%)`);
    } catch (err) {
      console.error("⚠️ updateStudentAttendanceStats failed:", err);
    }
  };

  // ---------------- HELPERS ----------------
  const getStudentsByCollege = (collegeId: string) =>
    students.filter((s) => s.collegeId === collegeId);

  const getAttendanceForDate = (date: string) =>
    attendanceRecords.filter((r) => r.date === date);

  const getStudentAttendancePercentage = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.attendancePercentage || 0;
  };

  // ---------------- CONTEXT VALUE ----------------
  const value: AuthContextType = {
    user,
    students,
    colleges,
    attendanceRecords,
    loading,
    login,
    logout,
    fetchData,
    requestPasswordReset,
    addStudent,
    updateStudent,
    deleteStudent,
    addCollege,
    updateCollege,
    markAttendance,
    getStudentsByCollege,
    getAttendanceForDate,
    getStudentAttendancePercentage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ---------------- HOOK ----------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
