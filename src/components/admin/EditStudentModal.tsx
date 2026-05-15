import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
}

const commonRanks = [
  "Cadet",
  "Lance Corporal",
  "Corporal",
  "Sergeant",
  "Company Quarter Master Sergeant (CQMS)",
  "Company Sergeant Major (CSM)",
  "Junior Under Officer (JUO)",
  "Senior Under Officer (SUO)",
];

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  open,
  onOpenChange,
  student,
}) => {
  const { colleges, updateStudent } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    regimentalNo: "",
    rank: "",
    collegeId: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        regimentalNo: student.regimentalNo || "",
        rank: student.rank || "",
        collegeId: student.collegeId || "",
      });
    }
  }, [student]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearPointerEvents = () => {
    setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 0);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      await updateStudent(student.id, formData);

      toast.success("Student updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update student");
    } finally {
      setLoading(false);
      clearPointerEvents();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
          clearPointerEvents();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Edit Student
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Full Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Regimental Number</Label>
            <Input
              value={formData.regimentalNo}
              onChange={(e) => handleChange("regimentalNo", e.target.value)}
              className="bg-white text-black"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Rank</Label>
            <Select
              value={formData.rank}
              onValueChange={(value) => handleChange("rank", value)}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select Rank" />
              </SelectTrigger>

              <SelectContent>
                {commonRanks.map((rank) => (
                  <SelectItem key={rank} value={rank}>
                    {rank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">College</Label>
            <Select
              value={formData.collegeId}
              onValueChange={(value) => handleChange("collegeId", value)}
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select College" />
              </SelectTrigger>

              <SelectContent>
                {colleges.map((college: any) => (
                  <SelectItem key={college.id} value={college.id}>
                    {college.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Student"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentModal;
