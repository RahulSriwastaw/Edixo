"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL, getAuthHeaders } from "@/lib/api-config";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BulkMetadataEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  questionIds: string[];
  onSuccess: () => void;
  allFolders?: any[];
}

interface FieldState {
  enabled: boolean;
  value: string;
}

export function BulkMetadataEditModal({
  isOpen,
  onClose,
  selectedCount,
  questionIds,
  onSuccess,
  allFolders = [],
}: BulkMetadataEditModalProps) {
  const [loading, setLoading] = useState(false);

  // Field states
  const [subject, setSubject] = useState<FieldState>({ enabled: false, value: "" });
  const [chapter, setChapter] = useState<FieldState>({ enabled: false, value: "" });
  const [type, setType] = useState<FieldState>({ enabled: false, value: "" });
  const [difficulty, setDifficulty] = useState<FieldState>({ enabled: false, value: "" });
  const [status, setStatus] = useState<FieldState>({ enabled: false, value: "" });
  const [exam, setExam] = useState<FieldState>({ enabled: false, value: "" });
  const [date, setDate] = useState<FieldState>({ enabled: false, value: "" });
  const [shift, setShift] = useState<FieldState>({ enabled: false, value: "" });

  const resetStates = () => {
    setSubject({ enabled: false, value: "" });
    setChapter({ enabled: false, value: "" });
    setType({ enabled: false, value: "" });
    setDifficulty({ enabled: false, value: "" });
    setStatus({ enabled: false, value: "" });
    setExam({ enabled: false, value: "" });
    setDate({ enabled: false, value: "" });
    setShift({ enabled: false, value: "" });
  };

  useEffect(() => {
    if (isOpen) {
      resetStates();
    }
  }, [isOpen]);

  const subjects = allFolders.filter((f) => f.depth === 0).map((f) => f.name);

  const handleUpdate = async () => {

    const updates: any = {};
    if (subject.enabled) updates.subject = subject.value;
    if (chapter.enabled) updates.chapter = chapter.value;
    if (type.enabled) updates.question_type = type.value;
    if (difficulty.enabled) updates.difficulty = difficulty.value;
    if (status.enabled) updates.status = status.value;
    if (exam.enabled) updates.exam = exam.value;
    if (date.enabled) updates.date = date.value;
    if (shift.enabled) updates.shift = shift.value;

    if (Object.keys(updates).length === 0) {
      toast.error("Please select at least one field to update");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/qbank/questions/bulk-update`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_ids: questionIds,
          updates,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`✓ ${data.updated_count} questions updated successfully`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to update questions");
      }
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("An error occurred during bulk update");
    } finally {
      setLoading(false);
    }
  };

  const isAnyFieldEnabled =
    subject.enabled ||
    chapter.enabled ||
    type.enabled ||
    difficulty.enabled ||
    status.enabled ||
    exam.enabled ||
    date.enabled ||
    shift.enabled;

  const handleCheckboxChange = (field: string, checked: boolean) => {
    const setterMap: any = {
      subject: setSubject,
      chapter: setChapter,
      type: setType,
      difficulty: setDifficulty,
      status: setStatus,
      exam: setExam,
      date: setDate,
      shift: setShift,
    };
    const setter = setterMap[field];
    if (setter) {
      setter((prev: FieldState) => ({ ...prev, enabled: checked }));
    }
  };

  const renderField = (
    id: string,
    label: string,
    state: FieldState,
    children: React.ReactNode
  ) => (
    <div className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 w-32 shrink-0">
        <Checkbox
          id={`check-${id}`}
          checked={state.enabled}
          onCheckedChange={(checked) => handleCheckboxChange(id, !!checked)}
        />
        <Label
          htmlFor={`check-${id}`}
          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer"
        >
          {label}
        </Label>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Bulk Edit ({selectedCount} questions)</DialogTitle>
          <DialogDescription className="text-xs">
            Select the fields you want to update for the {selectedCount} selected
            questions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-1">
          {renderField(
            "subject",
            "Subject",
            subject,
            <Select
              disabled={!subject.enabled}
              value={subject.value}
              onValueChange={(val) => setSubject((p) => ({ ...p, value: val }))}
            >
              <SelectTrigger className={subject.enabled ? "border-brand-primary ring-1 ring-brand-primary/20" : ""}>
                <SelectValue placeholder="Select Subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {renderField(
            "chapter",
            "Chapter",
            chapter,
            <Input
              disabled={!chapter.enabled}
              placeholder="Enter chapter name"
              value={chapter.value}
              onChange={(e) => setChapter((p) => ({ ...p, value: e.target.value }))}
              className={chapter.enabled ? "border-brand-primary ring-1 ring-brand-primary/20" : ""}
            />
          )}

          {renderField(
            "type",
            "Question Type",
            type,
            <Input
              disabled={!type.enabled}
              placeholder="e.g. MCQ, Subjective"
              value={type.value}
              onChange={(e) => setType((p) => ({ ...p, value: e.target.value }))}
              className={type.enabled ? "border-brand-primary ring-1 ring-brand-primary/20" : ""}
            />
          )}

          {renderField(
            "difficulty",
            "Difficulty",
            difficulty,
            <Select
              disabled={!difficulty.enabled}
              value={difficulty.value}
              onValueChange={(val) => setDifficulty((p) => ({ ...p, value: val }))}
            >
              <SelectTrigger className={difficulty.enabled ? "border-brand-primary ring-1 ring-brand-primary/20" : ""}>
                <SelectValue placeholder="Select Difficulty..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          )}

          {renderField(
            "status",
            "Status",
            status,
            <Select
              disabled={!status.enabled}
              value={status.value}
              onValueChange={(val) => setStatus((p) => ({ ...p, value: val }))}
            >
              <SelectTrigger className={status.enabled ? "border-brand-primary ring-1 ring-brand-primary/20" : ""}>
                <SelectValue placeholder="Select Status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          )}

          {renderField(
            "exam",
            "Exam",
            exam,
            <Input
              disabled={!exam.enabled}
              placeholder="e.g. SSC CGL, UPSC"
              value={exam.value}
              onChange={(e) => setExam((p) => ({ ...p, value: e.target.value }))}
              className={exam.enabled ? "border-brand-primary ring-1 ring-brand-primary/20" : ""}
            />
          )}

          {renderField(
            "date",
            "Date",
            date,
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  disabled={!date.enabled}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date.value && "text-muted-foreground",
                    date.enabled && "border-brand-primary ring-1 ring-brand-primary/20"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date.value ? format(new Date(date.value), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date.value ? new Date(date.value) : undefined}
                  onSelect={(val) => setDate((p) => ({ ...p, value: val ? val.toISOString() : "" }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          {renderField(
            "shift",
            "Shift",
            shift,
            <Select 
              disabled={!shift.enabled} 
              value={shift.value} 
              onValueChange={(val) => setShift((p) => ({ ...p, value: val }))}
            >
              <SelectTrigger className={shift.enabled ? "border-brand-primary ring-1 ring-brand-primary/20" : ""}>
                <SelectValue placeholder="Select Shift..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Shift 1</SelectItem>
                <SelectItem value="2">Shift 2</SelectItem>
                <SelectItem value="3">Shift 3</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 m-0 mt-2 bg-gray-50 border-t border-gray-100 flex-row justify-between gap-3 space-x-0">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!isAnyFieldEnabled || loading}
            className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Update All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
