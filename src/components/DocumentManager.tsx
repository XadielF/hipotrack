import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/types/supabase";
import {
  Check,
  Clock,
  Download,
  FileText,
  Upload,
  X,
  AlertCircle,
  Eye,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import type { DocumentRow } from "@/lib/supabase/documents";
import type { DocumentStatus, VirusScanStatus } from "@/types/supabase";

const stageLabels: Record<NonNullable<DocumentRow["stage"]>, string> = {
  pre_approval: "Pre-approval",
  appraisal: "Appraisal",
  underwriting: "Underwriting",
  closing: "Closing",
  funded: "Funded",
  other: "Other",
};

const statusBadgeClasses: Record<DocumentStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_upload: "bg-amber-100 text-amber-800",
  uploaded: "bg-blue-100 text-blue-800",
  pending_review: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  archived: "bg-zinc-200 text-zinc-700",
};

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  draft: <Clock className="h-4 w-4 text-slate-500" />,
  pending_upload: <Clock className="h-4 w-4 text-amber-500" />,
  uploaded: <Upload className="h-4 w-4 text-blue-500" />,
  pending_review: <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />,
  approved: <Check className="h-4 w-4 text-green-500" />,
  rejected: <X className="h-4 w-4 text-red-500" />,
  archived: <Clock className="h-4 w-4 text-zinc-500" />,
};

const virusScanBadgeClasses: Record<VirusScanStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  queued: "bg-slate-100 text-slate-700",
  scanning: "bg-blue-100 text-blue-800",
  clean: "bg-emerald-100 text-emerald-700",
  infected: "bg-red-100 text-red-800",
  failed: "bg-yellow-100 text-yellow-800",
};

const DocumentManager = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    documents,
    isLoading,
    uploadProgress,
    uploadDocument,
    getSignedUrlForAction,
  } = useDocuments();

  const stages = useMemo<NonNullable<DocumentRow["stage"]>[]>(
    () => ["pre_approval", "appraisal", "underwriting", "closing"],
    [],
  );

  const filteredDocuments = useMemo(() => {
    const filtered =
      activeTab === "all"
        ? documents
        : documents.filter((doc) => doc.stage === activeTab);

    if (!searchValue.trim()) {
      return filtered;
    }

    const lowered = searchValue.toLowerCase();
    return filtered.filter((doc) => {
      const values = [doc.display_name, doc.file_name, doc.uploaded_by_email ?? ""];
      return values.some((value) => value.toLowerCase().includes(lowered));
    });
  }, [activeTab, documents, searchValue]);

  const handleUploadButtonClick = () => {
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
          stage: activeTab === "all" ? undefined : (activeTab as DocumentRow["stage"]),
        },
        {},
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleViewDocument = async (doc: DocumentRow) => {
    const url = await getSignedUrlForAction(
      doc,
      "viewed",
      {},
      {
        stage: doc.stage,
        version: doc.version,
      },
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadDocument = async (doc: DocumentRow) => {
    const url = await getSignedUrlForAction(
      doc,
      "downloaded",
      {},
      {
        stage: doc.stage,
        version: doc.version,
      },
    );

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
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Document Manager</CardTitle>
          <Button className="flex items-center gap-2" onClick={handleUploadButtonClick}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-10"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            {stages.map((stage) => (
              <TabsTrigger key={stage} value={stage}>
                {stageLabels[stage]}
              </TabsTrigger>
            ))}
          </TabsList>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Uploading document</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading documents...
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.display_name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>
                              Uploaded by {doc.uploaded_by_email ?? "Unknown"}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>v{doc.version}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>
                              Stage: {doc.stage ? stageLabels[doc.stage] ?? doc.stage : "Unassigned"}
                            </span>
                            <span>•</span>
                            <span>{doc.file_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1 items-end">
                          <Badge
                            variant="secondary"
                            className={statusBadgeClasses[doc.status]}
                          >
                            {statusIcons[doc.status]}
                            <span className="ml-1">
                              {doc.status
                                .split("_")
                                .map((segment) =>
                                  segment.charAt(0).toUpperCase() + segment.slice(1),
                                )
                                .join(" ")}
                            </span>
                          </Badge>
                          {doc.is_secure && (
                            <Badge
                              variant="outline"
                              className={virusScanBadgeClasses[doc.virus_scan_status]}
                            >
                              <ShieldAlert className="h-3 w-3 mr-1" />
                              {doc.virus_scan_status
                                .split("_")
                                .map((segment) =>
                                  segment.charAt(0).toUpperCase() + segment.slice(1),
                                )
                                .join(" ")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No documents found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "all"
                      ? "You haven't uploaded any documents yet."
                      : `No documents found for the ${activeTab} stage.`}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            <span className="font-medium">{filteredDocuments.length}</span>{" "}
            documents • Last updated 2 hours ago
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Download All
            </Button>
            <Button variant="outline" size="sm">
              Request Documents
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentManager;
