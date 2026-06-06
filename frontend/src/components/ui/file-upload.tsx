import { useMemo, useRef, useState } from "react";
import { FileImage, FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxSizeBytes = 5 * 1024 * 1024;

export function FileUpload({ value, onChange, className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const meta = useMemo(() => {
    if (!value) {
      return null;
    }

    return {
      icon: value.type === "application/pdf" ? FileText : FileImage,
      size: `${(value.size / 1024 / 1024).toFixed(2)} MB`,
    };
  }, [value]);

  const validate = (file: File | null) => {
    if (!file) {
      onChange(null);
      setError(null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPEG, and PNG files are allowed.");
      return;
    }

    if (file.size > maxSizeBytes) {
      setError("The file exceeds the 5MB upload limit.");
      return;
    }

    setError(null);
    onChange(file);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          validate(event.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/80 px-5 py-10 text-center transition hover:border-primary/40 hover:bg-primary/5",
          dragActive && "border-primary bg-primary/5",
        )}
      >
        <UploadCloud className="h-8 w-8 text-primary" />
        <p className="mt-4 font-medium">Drag and drop support-ready upload target</p>
        <p className="mt-1 text-sm text-muted-foreground">PDF, JPEG, PNG up to 5MB. Stored with the leave request attachment API.</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(event) => validate(event.target.files?.[0] ?? null)}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {meta && value && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <meta.icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{value.name}</p>
              <p className="text-xs text-muted-foreground">{meta.size}</p>
            </div>
          </div>
          <button type="button" onClick={() => validate(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
