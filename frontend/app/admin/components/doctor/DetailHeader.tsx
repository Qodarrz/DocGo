"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DetailHeaderProps {
  title: string;
  description?: string;
  backUrl: string;

  // Action buttons
  showEdit?: boolean;
  editUrl?: string;
  onEditClick?: () => void;

  showDelete?: boolean;
  onDeleteClick?: () => void;
  deleteLabel?: string;

  showSave?: boolean;
  onSaveClick?: () => void;
  saveLoading?: boolean;
  saveDisabled?: boolean;

  showCancel?: boolean;
  onCancelClick?: () => void;

  // Status badge
  status?: "active" | "inactive" | "pending" | "completed" | string;
  statusLabel?: string;
  statusVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success";

  // Metadata chips
  metadata?: {
    icon?: React.ReactNode;
    label: string;
    value: string;
  }[];

  // Tags
  tags?: string[];

  // Custom actions
  customActions?: React.ReactNode;

  // Layout
  variant?: "default" | "compact" | "with-image";
  imageUrl?: string;
  imageAlt?: string;
}

export function DetailHeader({
  title,
  description,
  backUrl,
  showEdit = false,
  editUrl,
  onEditClick,
  showDelete = false,
  onDeleteClick,
  deleteLabel = "Hapus",
  showSave = false,
  onSaveClick,
  saveLoading = false,
  saveDisabled = false,
  showCancel = false,
  onCancelClick,
  status,
  statusLabel,
  statusVariant,
  metadata,
  tags,
  customActions,
  variant = "default",
  imageUrl,
  imageAlt,
}: DetailHeaderProps) {
  const router = useRouter();

  const handleEdit = () => {
    if (onEditClick) {
      onEditClick();
    } else if (editUrl) {
      router.push(editUrl);
    }
  };

  const getStatusVariant = () => {
    if (statusVariant) return statusVariant;

    switch (status) {
      case "active":
      case "completed":
        return "default";
      case "inactive":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "inactive":
        return <X className="h-3 w-3 mr-1" />;
      case "pending":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`mb-6 ${variant === "with-image" ? "space-y-6" : "space-y-4"}`}
    >
      {/* Main Header Row */}
      <div
        className={`flex flex-col ${variant === "with-image" ? "lg:flex-row lg:items-start" : "sm:flex-row sm:items-center"} justify-between gap-4`}
      >
        {/* Left side with back button, title, and status */}
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backUrl)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {variant === "with-image" && imageUrl && (
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={imageUrl}
                alt={imageAlt || title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold truncate">{title}</h1>

              {status && (
                <Badge
                  variant="default"
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  {getStatusIcon()}
                  {statusLabel || status}
                </Badge>
              )}
            </div>

            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {/* Right side with action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {customActions}

          {showCancel && onCancelClick && (
            <Button
              variant="outline"
              onClick={onCancelClick}
              disabled={saveLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
          )}

          {showSave && onSaveClick && (
            <Button
              onClick={onSaveClick}
              disabled={saveDisabled || saveLoading}
            >
              {saveLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          )}

          {showEdit && (
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {showDelete && onDeleteClick && (
            <Button variant="destructive" onClick={onDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Row */}
      {metadata && metadata.length > 0 && (
        <div className="flex flex-wrap gap-4 items-center">
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {item.icon}
              <span className="text-muted-foreground">{item.label}:</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tags Row */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Separator */}
      {variant === "default" && (metadata || tags) && <Separator />}
    </div>
  );
}

// Pre-built metadata icons
export const metadataIcons = {
  user: <User className="h-3 w-3" />,
  calendar: <Calendar className="h-3 w-3" />,
  phone: <Phone className="h-3 w-3" />,
  mail: <Mail className="h-3 w-3" />,
  briefcase: <Briefcase className="h-3 w-3" />,
  award: <Award className="h-3 w-3" />,
};
