import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { FileText, Upload, Download, Trash2, ExternalLink } from "lucide-react";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CV: "CV",
  COVER_LETTER: "Lettre de motivation",
  SYNTHESIS: "Synthèse",
  REPORT: "Rapport",
  OTHER: "Autre",
};

export default function Documents() {
  const { user } = useAuth();
  const [, params] = useRoute("/bilans/:id/documents");
  const bilanId = params?.id ? parseInt(params.id) : 0;

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<"CV" | "COVER_LETTER" | "SYNTHESIS" | "REPORT" | "OTHER">("CV");

  const { data: documents, isLoading, refetch } = trpc.documents.listByBilan.useQuery(
    { bilanId },
    { enabled: bilanId > 0 }
  );

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Document uploadé avec succès");
      setUploadFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document supprimé");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    // Convertir le fichier en base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1]; // Enlever le préfixe data:...;base64,

      uploadMutation.mutate({
        bilanId,
        type: documentType,
        name: uploadFile.name,
        fileData: base64Data,
        mimeType: uploadFile.type,
      });
    };
    reader.readAsDataURL(uploadFile);
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      deleteMutation.mutate({ id });
    }
  };

  const groupedDocuments = documents?.reduce((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">Gestion des documents du bilan</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Uploader un document</CardTitle>
            <CardDescription>Ajouter un nouveau document au bilan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="file">Fichier</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type de document</Label>
                <select
                  id="type"
                  className="w-full h-10 px-3 border rounded-md"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                >
                  <option value="CV">CV</option>
                  <option value="COVER_LETTER">Lettre de motivation</option>
                  <option value="SYNTHESIS">Synthèse</option>
                  <option value="REPORT">Rapport</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || uploadMutation.isPending}
              className="w-full md:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadMutation.isPending ? "Upload en cours..." : "Uploader"}
            </Button>
          </CardContent>
        </Card>

        {/* Documents List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedDocuments || {}).map(([type, docs]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS]}
                  </CardTitle>
                  <CardDescription>{docs.length} document(s)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="font-medium">{doc.fileName}</h4>
                          <p className="text-sm text-gray-500">
                            Uploadé le{" "}
                            {new Date(doc.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <Badge variant="outline">{DOCUMENT_TYPE_LABELS[doc.type]}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {user.role === "CONSULTANT" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(doc.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun document</h3>
              <p className="text-sm text-gray-500 text-center">
                Commencez par uploader un document
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
