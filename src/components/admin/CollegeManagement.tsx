import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GraduationCap, Plus, MoreVertical, Edit, MapPin } from "lucide-react";
import { toast } from "sonner";

interface College {
  id: string;
  name: string;
  code: string;
  location: string;
}

const CollegeManagement = () => {
  const { colleges, students, addCollege, updateCollege } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
  });

  const handleAddCollege = async (collegeData: Omit<College, "id">) => {
    try {
      await addCollege(collegeData);
      toast.success("College added successfully!");
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to add college. Please try again.");
    }
  };

  const handleUpdateCollege = async (id: string, updates: Partial<College>) => {
    try {
      await updateCollege(id, updates);
      toast.success("College updated successfully!");
      setEditingCollege(null);
      resetForm();
    } catch (error) {
      toast.error("Failed to update college. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      location: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.location) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingCollege) {
      handleUpdateCollege(editingCollege.id, formData);
    } else {
      handleAddCollege(formData);
    }
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      code: college.code,
      location: college.location,
    });
  };

  const getStudentCount = (collegeId: string) => {
    return students.filter((student) => student.collegeId === collegeId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            College Management
          </h2>
          <p className="text-gray-600">
            Manage colleges and institutions in the system
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add College
        </Button>
      </div>

      {/* Colleges Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">
                College Information
              </TableHead>
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Students</TableHead>
              <TableHead className="font-semibold w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colleges.map((college) => (
              <TableRow key={college.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {college.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {college.code}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {college.location}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getStudentCount(college.id)} students
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(college)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit College
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit College Modal */}
      <Dialog
        open={showAddModal || editingCollege !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingCollege(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingCollege ? "Edit College" : "Add New College"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="college-name" className="text-sm font-medium">
                  College Name
                </Label>
                <Input
                  id="college-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter college name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college-code" className="text-sm font-medium">
                  College Code
                </Label>
                <Input
                  id="college-code"
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="e.g., AIT, MCE"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="college-location"
                  className="text-sm font-medium"
                >
                  Location
                </Label>
                <Input
                  id="college-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Enter location"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCollege(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {editingCollege ? "Update College" : "Add College"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollegeManagement;
