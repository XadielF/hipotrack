import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  Clock,
  FileText,
  Upload,
  X,
  AlertCircle,
  Eye,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  stage: string;
  status: "pending" | "approved" | "rejected";
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}

const DocumentManager = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Income Verification.pdf",
      stage: "Pre-approval",
      status: "approved",
      uploadedBy: "John Doe",
      uploadedAt: "2023-05-15",
      version: 1,
    },
    {
      id: "2",
      name: "Bank Statements.pdf",
      stage: "Pre-approval",
      status: "pending",
      uploadedBy: "John Doe",
      uploadedAt: "2023-05-16",
      version: 2,
    },
    {
      id: "3",
      name: "Property Appraisal.pdf",
      stage: "Appraisal",
      status: "rejected",
      uploadedBy: "Agent Smith",
      uploadedAt: "2023-05-20",
      version: 1,
    },
    {
      id: "4",
      name: "Credit Report.pdf",
      stage: "Pre-approval",
      status: "approved",
      uploadedBy: "John Doe",
      uploadedAt: "2023-05-10",
      version: 1,
    },
    {
      id: "5",
      name: "Purchase Agreement.pdf",
      stage: "Underwriting",
      status: "pending",
      uploadedBy: "Agent Smith",
      uploadedAt: "2023-05-22",
      version: 1,
    },
  ]);

  const stages = ["Pre-approval", "Appraisal", "Underwriting", "Closing"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <X className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredDocuments =
    activeTab === "all"
      ? documents
      : documents.filter(
          (doc) => doc.stage.toLowerCase() === activeTab.toLowerCase(),
        );

  const uploadProgress = 75; // Mock upload progress

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Document Manager</CardTitle>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-10" />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            {stages.map((stage) => (
              <TabsTrigger key={stage} value={stage.toLowerCase()}>
                {stage}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Upload Progress Indicator (mockup) */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Uploading: Tax_Returns_2023.pdf
                </span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>Uploaded by {doc.uploadedBy}</span>
                            <span>•</span>
                            <span>{doc.uploadedAt}</span>
                            <span>•</span>
                            <span>v{doc.version}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(doc.status)}
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doc.status === "rejected" && (
                            <Button variant="ghost" size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
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
