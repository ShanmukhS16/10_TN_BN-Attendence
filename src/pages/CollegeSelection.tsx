import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarDays,
  GraduationCap,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CollegeSelection = () => {
  const { user, colleges } = useAuth();
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (selectedCollege && selectedDate) {
      navigate(
        `/attendance?college=${selectedCollege}&date=${format(selectedDate, "yyyy-MM-dd")}`,
      );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Select College & Date
            </h1>
            <p className="text-gray-600">
              Choose your college and the date for attendance marking
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* College Selection */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Select College
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {colleges.map((college) => (
                  <div
                    key={college.id}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                      selectedCollege === college.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm",
                    )}
                    onClick={() => setSelectedCollege(college.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {college.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="w-3 h-3" />
                          {college.location}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          {college.code}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2",
                          selectedCollege === college.id
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300",
                        )}
                      >
                        {selectedCollege === college.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setShowCalendar(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {selectedDate && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Selected:</span>{" "}
                      {format(selectedDate, "EEEE, MMMM do, yyyy")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Next Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleNext}
              disabled={!selectedCollege || !selectedDate}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 h-auto shadow-lg"
            >
              Next
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeSelection;
