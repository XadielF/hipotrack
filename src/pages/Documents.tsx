import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Download, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  uploadDate?: string;
  size?: string;
  required: boolean;
}

const Documents: React.FC = () => {
  const documents: Document[] = [
    {
      id: '1',
      name: 'Income Verification',
      type: 'W-2 Forms',
      status: 'approved',
      uploadDate: '2024-01-15',
      size: '2.3 MB',
      required: true
    },
    {
      id: '2',
      name: 'Bank Statements',
      type: 'Financial',
      status: 'uploaded',
      uploadDate: '2024-01-14',
      size: '1.8 MB',
      required: true
    },
    {
      id: '3',
      name: 'Property Appraisal',
      type: 'Property',
      status: 'pending',
      required: true
    },
    {
      id: '4',
      name: 'Credit Report',
      type: 'Financial',
      status: 'approved',
      uploadDate: '2024-01-10',
      size: '0.5 MB',
      required: true
    },
    {
      id: '5',
      name: 'Employment Letter',
      type: 'Income',
      status: 'rejected',
      uploadDate: '2024-01-12',
      size: '0.3 MB',
      required: true
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'uploaded':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800',
      uploaded: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const completedDocs = documents.filter(doc => doc.status === 'approved').length;
  const totalDocs = documents.filter(doc => doc.required).length;
  const progressPercentage = (completedDocs / totalDocs) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Center</h1>
          <p className="text-gray-600">Upload and manage your mortgage documents</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Completed Documents</span>
                <span>{completedDocs} of {totalDocs}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600">
                {totalDocs - completedDocs} documents remaining to complete your application
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Required Documents</CardTitle>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(doc.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-500">{doc.type}</p>
                      {doc.uploadDate && (
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                          {doc.size && ` • ${doc.size}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    
                    <div className="flex gap-1">
                      {doc.status !== 'pending' && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {(doc.status === 'pending' || doc.status === 'rejected') && (
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;