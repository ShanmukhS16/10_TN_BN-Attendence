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
  attendancePercentage: number;
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
  addStudent: (student: Omit<Student, "id" | "attendancePercentage" | "createdBy">) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addCollege: (college: Omit<College, "id">) => Promise<void>;
  updateCollege: (id: string, updates: Partial<College>) => Promise<void>;
  markAttendance: (studentId: string, date: string, present: boolean) => Promise<void>;
  getStudentsByCollege: (collegeId: string) => Student[];
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getStudentAttendancePercentage: (studentId: string) => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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

  const requestPasswordReset = async (email: string): Promise<string> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: "https://10-tn-bn-attendence.vercel.app/reset-password",    });
    return error ? `❌ ${error.message}` : "✅ Password reset link sent!";
  };

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

const addStudent = async (studentData: Omit<Student, "id" | "attendancePercentage" | "createdBy">) => {
  if (!user) return;

  const newStudent = {
    ...studentData,
    attendancePercentage: 0,
    createdBy: user.id,
  };

  const { error } = await supabase.from("students").insert(newStudent);
  if (error) {
    console.error("❌ Failed to insert student:", error.message);
    return;
  }

  await fetchData(); // make sure to refetch data after insertion
};


  const updateStudent = async (id: string, updates: Partial<Student>) => {
    await supabase.from("students").update(updates).eq("id", id);
    await fetchData();
  };

  const deleteStudent = async (id: string) => {
    await supabase.from("students").delete().eq("id", id);
    await supabase.from("attendance").delete().eq("studentId", id);
    await fetchData();
  };

  const addCollege = async (college: Omit<College, "id">) => {
    await supabase.from("colleges").insert(college);
    await fetchData();
  };

  const updateCollege = async (id: string, updates: Partial<College>) => {
    await supabase.from("colleges").update(updates).eq("id", id);
    await fetchData();
  };

  const markAttendance = async (studentId: string, date: string, present: boolean) => {
    const existing = attendanceRecords.find(r => r.studentId === studentId && r.date === date);
    const record = {
      studentId,
      date,
      present,
      markedBy: user?.id || "system",
      timestamp: Date.now(),
    };
    if (existing) {
      await supabase.from("attendance").update(record).eq("id", existing.id);
    } else {
      await supabase.from("attendance").insert(record);
    }
    await updateStudentAttendancePercentage(studentId);
    await fetchData();
  };

  const updateStudentAttendancePercentage = async (studentId: string) => {
    const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);
    const presentCount = studentRecords.filter(r => r.present).length;
    const percentage = studentRecords.length
      ? Math.round((presentCount / studentRecords.length) * 100)
      : 0;
    await updateStudent(studentId, { attendancePercentage: percentage });
  };

  const getStudentsByCollege = (collegeId: string) => {
    return students.filter((s) => s.collegeId === collegeId);
  };

  const getAttendanceForDate = (date: string) => {
    return attendanceRecords.filter((r) => r.date === date);
  };

  const getStudentAttendancePercentage = (studentId: string) => {
    const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);
    const presentCount = studentRecords.filter(r => r.present).length;
    return studentRecords.length ? Math.round((presentCount / studentRecords.length) * 100) : 0;
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
