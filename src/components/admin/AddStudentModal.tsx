import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { addStudent, colleges } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    regimentalNo: "",
    rank: "",
    collegeId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (
        !formData.name ||
        !formData.regimentalNo ||
        !formData.rank ||
        !formData.collegeId
      ) {
        toast.error("Please fill in all fields");
        return;
      }

      await addStudent(formData);
      toast.success("Student added successfully!");

      // Reset form and close modal
      setFormData({
        name: "",
        regimentalNo: "",
        rank: "",
        collegeId: "",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const commonRanks = [
    "Cadet",
    "Senior Cadet",
    "Cadet Captain",
    "Cadet Major",
    "Cadet Lieutenant Colonel",
    "Lieutenant",
    "Captain",
    "Major",
    "Lieutenant Colonel",
    "Colonel",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Student
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="student-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter student's full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regimental-no" className="text-sm font-medium">
                Regimental Number
              </Label>
              <Input
                id="regimental-no"
                type="text"
                value={formData.regimentalNo}
                onChange={(e) =>
                  handleInputChange("regimentalNo", e.target.value)
                }
                placeholder="e.g., REG001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank" className="text-sm font-medium">
                Rank
              </Label>
              <Select
                value={formData.rank}
                onValueChange={(value) => handleInputChange("rank", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rank" />
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
              <Label htmlFor="college" className="text-sm font-medium">
                College
              </Label>
              <Select
                value={formData.collegeId}
                onValueChange={(value) => handleInputChange("collegeId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>
                      {college.name} ({college.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
