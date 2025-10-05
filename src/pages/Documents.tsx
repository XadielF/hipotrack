import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  Upload,
} from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import type { DocumentRow } from "@/lib/supabase/documents";
import type { DocumentStatus } from "@/types/supabase";

const statusLabels: Record<DocumentStatus, string> = {
  draft: "Draft",
  pending_upload: "Pending Upload",
  uploaded: "Uploaded",
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

const statusBadges: Record<DocumentStatus, string> = {
  draft: "bg-slate-100 text-slate-800",
  pending_upload: "bg-amber-100 text-amber-800",
  uploaded: "bg-blue-100 text-blue-800",
  pending_review: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  archived: "bg-zinc-200 text-zinc-700",
};

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  draft: <Clock className="h-4 w-4 text-slate-500" />,
  pending_upload: <Upload className="h-4 w-4 text-amber-500" />,
  uploaded: <Upload className="h-4 w-4 text-blue-500" />,
  pending_review: <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />,
  approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  rejected: <AlertCircle className="h-4 w-4 text-red-500" />,
  archived: <Clock className="h-4 w-4 text-zinc-500" />,
};

const formatBytes = (size?: number | null) => {
  if (!size) {
    return null;
  }
  const megabytes = size / (1024 * 1024);
  if (megabytes < 0.1) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${megabytes.toFixed(1)} MB`;
};

const getDocumentType = (document: DocumentRow) => {
  const metadata = document.metadata as Record<string, unknown> | null;
  const possibleType =
    metadata && typeof metadata === "object" && metadata
      ? (metadata["type"] as string | undefined) ??
        (metadata["category"] as string | undefined)
      : undefined;

  if (possibleType) {
    return possibleType;
  }

  if (document.stage) {
    return document.stage
      .split("_")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  }

  return "Document";
};

const Documents: React.FC = () => {
  const [pendingUpload, setPendingUpload] = useState<DocumentRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    documents,
    isLoading,
    uploadProgress,
    uploadDocument,
    getSignedUrlForAction,
    reload,
  } = useDocuments({ secureOnly: false });

  const requiredDocuments = useMemo(
    () => documents.filter((doc) => doc.is_required),
    [documents],
  );

  const completedDocs = useMemo(
    () => requiredDocuments.filter((doc) => doc.status === "approved").length,
    [requiredDocuments],
  );

  const totalDocs = requiredDocuments.length;
  const progressPercentage = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0;

  const handleUploadClick = (document?: DocumentRow) => {
    setPendingUpload(document ?? null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await uploadDocument(
        file,
        {
          displayName: pendingUpload?.display_name ?? file.name,
          stage: pendingUpload?.stage ?? "other",
          isSecure: pendingUpload?.is_secure ?? false,
          isRequired: pendingUpload?.is_required ?? true,
          metadata: pendingUpload?.metadata ?? null,
        },
        {},
      );
      await reload();
    } finally {
      setPendingUpload(null);
      event.target.value = "";
    }
  };

  const handleViewDocument = async (doc: DocumentRow) => {
    const url = await getSignedUrlForAction(doc, "viewed", {}, {
      stage: doc.stage,
      requirement: doc.metadata,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadDocument = async (doc: DocumentRow) => {
    const url = await getSignedUrlForAction(doc, "downloaded", {}, {
      stage: doc.stage,
      requirement: doc.metadata,
    });
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = doc.file_name;
    anchor.rel = "noopener";
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Center</h1>
          <p className="text-gray-600">Upload and manage your mortgage documents</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Completed Documents</span>
                <span>
                  {completedDocs} of {totalDocs}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600">
                {totalDocs - completedDocs} documents remaining to complete your application
              </p>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading document...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Required Documents</CardTitle>
            <Button className="flex items-center gap-2" onClick={() => handleUploadClick()}>
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading documents...
              </div>
            ) : requiredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <AlertCircle className="h-6 w-6 mb-2" />
                No required documents available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {requiredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      {statusIcons[doc.status]}
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.display_name}</h3>
                        <p className="text-sm text-gray-500">{getDocumentType(doc)}</p>
                        <p className="text-xs text-gray-400">
                          {doc.uploaded_at
                            ? `Uploaded ${new Date(doc.uploaded_at).toLocaleDateString()}`
                            : "Upload pending"}
                          {doc.size_bytes ? ` • ${formatBytes(doc.size_bytes)}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={statusBadges[doc.status]}>{statusLabels[doc.status]}</Badge>

                      <div className="flex gap-1">
                        {doc.status !== "pending_upload" && doc.status !== "draft" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleViewDocument(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleDownloadDocument(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(doc.status === "pending_upload" || doc.status === "rejected") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUploadClick(doc)}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
