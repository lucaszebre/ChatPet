import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileText, Image, Upload, X } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";

interface FileUploadDropzoneProps {
  onFileSelect?: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  onFileSelect,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
  },
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
}) => {
  const { t } = useTranslation("file-upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = multiple
        ? [...uploadedFiles, ...acceptedFiles]
        : acceptedFiles;
      setUploadedFiles(newFiles);

      if (onFileSelect && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, uploadedFiles, multiple]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple,
    });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return `0 ${t("fileFormat.bytes")}`;
    const k = 1024;
    const sizes = [
      t("fileFormat.bytes"),
      t("fileFormat.kb"),
      t("fileFormat.mb"),
      t("fileFormat.gb"),
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-primary/50",
              uploadedFiles.length > 0 && "mb-4"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive ? t("dropFiles") : t("dragAndDrop")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("supports")} {Object.values(accept).flat().join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("maxSize")} {formatFileSize(maxSize)}
              </p>
            </div>
          </div>

          {/* File rejections */}
          {fileRejections.length > 0 && (
            <div className="mt-4 space-y-2">
              {fileRejections.map(({ file, errors }) => (
                <div
                  key={file.name}
                  className="text-sm text-destructive bg-destructive/10 p-2 rounded"
                >
                  <p className="font-medium">{file.name}</p>
                  {errors.map((error) => (
                    <p key={error.code} className="text-xs">
                      {error.message}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("uploadedFiles")}</h4>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
