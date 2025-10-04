import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { Tables } from '@/types/supabase';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Shield, 
  Lock,
  Scan,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';

type SecureDocument = Tables<'secure_documents'>;

const SecureDocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<SecureDocument[]>([
    {
      id: '1',
      name: 'W-2 Tax Form 2023',
      type: 'Tax Document',
      status: 'approved',
      uploadDate: '2024-01-15',
      size: '2.3 MB',
      encryptionStatus: 'encrypted',
      accessLevel: 'restricted',
      lastAccessed: '2024-01-15T10:30:00Z',
      accessCount: 3,
      virusScanStatus: 'clean',
      retentionDate: '2031-01-15'
    },
    {
      id: '2',
      name: 'Bank Statement - December',
      type: 'Financial',
      status: 'scanning',
      uploadDate: '2024-01-14',
      size: '1.8 MB',
      encryptionStatus: 'encrypted',
      accessLevel: 'team',
      lastAccessed: '2024-01-14T16:20:00Z',
      accessCount: 1,
      virusScanStatus: 'pending',
      retentionDate: '2031-01-14'
    },
    {
      id: '3',
      name: 'Property Appraisal Report',
      type: 'Property',
      status: 'pending',
      uploadDate: null,
      size: null,
      encryptionStatus: 'processing',
      accessLevel: 'restricted',
      lastAccessed: null,
      accessCount: 0,
      virusScanStatus: 'pending',
      retentionDate: null
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const getStatusIcon = (status: SecureDocument['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scanning':
        return <Scan className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: SecureDocument['status']) => {
    const variants: Record<SecureDocument['status'], string> = {
      approved: 'bg-green-100 text-green-800',
      scanning: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
      uploaded: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getEncryptionBadge = (
    status: SecureDocument['encryptionStatus']
  ) => {
    const variants: Record<SecureDocument['encryptionStatus'], string> = {
      encrypted: 'bg-green-100 text-green-800 border-green-200',
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        <Lock className="h-3 w-3 mr-1" />
        {status === 'encrypted' ? 'AES-256' : status}
      </Badge>
    );
  };

  const getAccessLevelColor = (level: SecureDocument['accessLevel']) => {
    const colors: Record<SecureDocument['accessLevel'], string> = {
      public: 'text-green-600',
      team: 'text-blue-600',
      restricted: 'text-red-600'
    };
    return colors[level];
  };

  const getVirusScanBadge = (status: SecureDocument['virusScanStatus']) => {
    const variants: Record<SecureDocument['virusScanStatus'], string> = {
      clean: 'bg-green-100 text-green-800',
      pending: 'bg-gray-100 text-gray-800',
      infected: 'bg-red-100 text-red-800',
      failed: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status]} variant="outline">
        <Shield className="h-3 w-3 mr-1" />
        {status === 'clean' ? 'Virus Free' : status}
      </Badge>
    );
  };

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownload = (docId: string) => {
    console.log('Secure download initiated for document:', docId);
    // In real implementation, this would create an audit log entry
  };

  const handleDelete = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    console.log('Document securely deleted:', docId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const approvedDocs = documents.filter(doc => doc.status === 'approved').length;
  const totalDocs = documents.length;
  const progressPercentage = totalDocs > 0 ? (approvedDocs / totalDocs) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Document Center</h1>
          <p className="text-gray-600">Enterprise-grade document security and compliance</p>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Encryption</p>
                  <p className="text-xs text-gray-500">AES-256</p>
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
                  <p className="text-xs text-gray-500">Real-time</p>
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
                  <p className="text-xs text-gray-500">Complete</p>
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
                  <p className="text-xs text-gray-500">7 Years</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500">
                  Encrypting and scanning for security threats...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Progress */}
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
                <span>Approved Documents</span>
                <span>{approvedDocs} of {totalDocs}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>GDPR & GLBA Compliant</span>
                <span>SOC 2 Type II Certified</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Secure Documents</CardTitle>
            <Button onClick={handleUpload} disabled={isUploading} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 space-y-3"
                >
                  {/* Document Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                        {doc.uploadDate && (
                          <p className="text-xs text-gray-400">
                            Uploaded: {formatDate(doc.uploadDate)}
                            {doc.size && ` • ${doc.size}`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <div className="flex gap-1">
                        {doc.status === 'approved' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Security Information */}
                  <div className="flex flex-wrap gap-2">
                    {getEncryptionBadge(doc.encryptionStatus)}
                    {getVirusScanBadge(doc.virusScanStatus)}
                    <Badge variant="outline" className={getAccessLevelColor(doc.accessLevel)}>
                      Access: {doc.accessLevel}
                    </Badge>
                  </div>

                  {/* Access Information */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      Accessed {doc.accessCount} times
                      {doc.lastAccessed && ` • Last: ${formatDate(doc.lastAccessed)}`}
                    </span>
                    {doc.retentionDate && (
                      <span>Retention until: {formatDate(doc.retentionDate)}</span>
                    )}
                  </div>

                  {/* Security Alerts */}
                  {doc.virusScanStatus === 'infected' && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Security threat detected. Document quarantined.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Security & Compliance</h3>
          </div>
          <p className="text-sm text-blue-800 mb-2">
            All documents are encrypted with AES-256 encryption, scanned for malware, and stored in SOC 2 Type II certified infrastructure.
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">GDPR Compliant</Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">GLBA Certified</Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">SOC 2 Type II</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureDocumentManager;