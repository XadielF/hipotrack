import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  Lock,
  Scan,
  Shield,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import type { DocumentRow } from "@/lib/supabase/documents";
import type { DocumentStatus, VirusScanStatus } from "@/types/supabase";

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
  draft: "bg-slate-100 text-slate-700",
  pending_upload: "bg-amber-100 text-amber-800",
  uploaded: "bg-blue-100 text-blue-800",
  pending_review: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  archived: "bg-zinc-200 text-zinc-700",
};

const virusScanLabels: Record<VirusScanStatus, string> = {
  pending: "Pending",
  queued: "Queued",
  scanning: "Scanning",
  clean: "Clean",
  infected: "Infected",
  failed: "Failed",
};

const virusScanBadgeClasses: Record<VirusScanStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  queued: "bg-slate-100 text-slate-700",
  scanning: "bg-blue-100 text-blue-800",
  clean: "bg-emerald-100 text-emerald-700",
  infected: "bg-red-100 text-red-800",
  failed: "bg-yellow-100 text-yellow-800",
};

const getMetadataValue = (document: DocumentRow, key: string) => {
  const metadata = document.metadata as Record<string, unknown> | null;
  if (metadata && typeof metadata === "object" && key in metadata) {
    return metadata[key] as string | undefined;
  }
  return undefined;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString();
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

const SecureDocumentManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    documents,
    isLoading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    getSignedUrlForAction,
    refreshVirusScanStatus,
    updateStatus,
    reload,
  } = useDocuments({ secureOnly: true });

  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) {
      return documents;
    }
    const lower = searchTerm.toLowerCase();
    return documents.filter((doc) => {
      const values = [
        doc.display_name,
        doc.file_name,
        doc.uploaded_by_email ?? "",
        getMetadataValue(doc, "type") ?? "",
      ];
      return values.some((value) => value.toLowerCase().includes(lower));
    });
  }, [documents, searchTerm]);

  const approvedDocs = documents.filter((doc) => doc.status === "approved").length;
  const totalDocs = documents.length;
  const progressPercentage = totalDocs > 0 ? (approvedDocs / totalDocs) * 100 : 0;

  const handleUploadClick = (doc?: DocumentRow) => {
    setSelectedDocument(doc ?? null);
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
          displayName: selectedDocument?.display_name ?? file.name,
          stage: selectedDocument?.stage ?? "other",
          isSecure: true,
          isRequired: selectedDocument?.is_required ?? false,
          metadata: selectedDocument?.metadata ?? null,
        },
        {},
      );
      await reload();
    } finally {
      setSelectedDocument(null);
      event.target.value = "";
    }
  };

  const handleViewDocument = async (doc: DocumentRow) => {
    const url = await getSignedUrlForAction(doc, "viewed", {}, {
      stage: doc.stage,
      security: doc.metadata,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadDocument = async (doc: DocumentRow) => {
    const url = await getSignedUrlForAction(doc, "downloaded", {}, {
      stage: doc.stage,
      security: doc.metadata,
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

  const handleDeleteDocument = async (doc: DocumentRow) => {
    await deleteDocument(doc, {}, "Requested by administrator");
    await reload();
  };

  const handleVirusScanRefresh = async (doc: DocumentRow) => {
    await refreshVirusScanStatus(doc.id);
    await reload();
  };

  const handleStatusOverride = async (doc: DocumentRow, status: DocumentStatus) => {
    await updateStatus(doc.id, status);
    await reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Document Center</h1>
          <p className="text-gray-600">
            Enterprise-grade document security, encryption and compliance monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Encryption</p>
                  <p className="text-xs text-gray-500">AES-256 at rest</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Virus Scan</p>
                  <p className="text-xs text-gray-500">Automated & on-demand</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Audit Trail</p>
                  <p className="text-xs text-gray-500">Real-time tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Retention</p>
                  <p className="text-xs text-gray-500">Policy-based lifecycle</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading secure document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500">
                  Files are encrypted, access controlled and scanned for threats automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Approved Secure Documents</span>
                <span>
                  {approvedDocs} of {totalDocs}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Zero-trust access controls</span>
                <span>Full audit logging enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Secure Documents</CardTitle>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search secure documents"
                  className="w-64"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <Button className="flex items-center gap-2" onClick={() => handleUploadClick()}>
                  <Upload className="h-4 w-4" />
                  Upload Secure Document
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading secure documents...
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <ShieldAlert className="h-6 w-6 mb-2" />
                No secure documents found for your query.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => {
                  const encryptionStatus = getMetadataValue(doc, "encryption_status") ?? "encrypted";
                  const accessLevel = getMetadataValue(doc, "access_level") ?? "restricted";
                  const lastAccessed = getMetadataValue(doc, "last_accessed");
                  const retentionDate = getMetadataValue(doc, "retention_date") ?? doc.retention_date;

                  return (
                    <div key={doc.id} className="p-4 border rounded-lg space-y-3 bg-white shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {doc.status === "approved" && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {doc.status === "pending_review" && (
                              <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                            )}
                            {doc.status === "rejected" && (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                            {doc.status === "uploaded" && (
                              <Clock className="h-5 w-5 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{doc.display_name}</h3>
                            <p className="text-sm text-gray-500">
                              {getMetadataValue(doc, "type") ?? "Secure Document"}
                            </p>
                            <p className="text-xs text-gray-400">
                              Uploaded {new Date(doc.uploaded_at).toLocaleString()}
                              {formatBytes(doc.size_bytes) ? ` • ${formatBytes(doc.size_bytes)}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusBadges[doc.status]}>{statusLabels[doc.status]}</Badge>
                          <Badge variant="outline" className={virusScanBadgeClasses[doc.virus_scan_status]}>
                            <Scan className="h-3 w-3 mr-1" />
                            {virusScanLabels[doc.virus_scan_status]}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <Label className="text-xs uppercase text-gray-400">Access Level</Label>
                          <p className="font-medium text-gray-800">{accessLevel}</p>
                        </div>
                        <div>
                          <Label className="text-xs uppercase text-gray-400">Encryption</Label>
                          <Badge variant="outline" className="mt-1 inline-flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            {encryptionStatus}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs uppercase text-gray-400">Last Accessed</Label>
                          <p>{formatDate(lastAccessed ?? doc.updated_at) ?? "No access recorded"}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Retention until {formatDate(retentionDate) ?? "policy default"}</span>
                          <span>•</span>
                          <span>Version v{doc.version}</span>
                        </div>
                        <div className="flex items-center gap-2">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleVirusScanRefresh(doc)}
                          >
                            <Scan className="h-4 w-4 mr-1" />
                            Re-scan
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleStatusOverride(doc, "pending_review")}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Re-evaluate
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => void handleDeleteDocument(doc)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {(doc.virus_scan_status === "infected" || doc.virus_scan_status === "failed") && (
                        <Alert variant="destructive">
                          <AlertDescription className="text-sm">
                            Security alert: Virus scan reported "{virusScanLabels[doc.virus_scan_status]}".
                            Access to this document should be reviewed immediately.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecureDocumentManager;
