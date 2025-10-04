import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, BookOpen } from "lucide-react";

const Curriculum = () => {
  const { profile, checkAuth } = useOutletContext<any>();
  const [uploading, setUploading] = useState(false);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      loadCurriculum();
    }
  }, [profile]);

  const loadCurriculum = async () => {
    const { data } = await supabase
      .from("curriculum")
      .select("*")
      .eq("institution_id", profile.institution_id)
      .order("created_at", { ascending: false });

    if (data) setCurriculum(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.institution_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("curriculum")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("curriculum").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("curriculum").insert({
        institution_id: profile.institution_id,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        uploaded_by: profile.user_id,
      });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Curriculum uploaded successfully",
      });

      loadCurriculum();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Curriculum Management</h1>
        <p className="text-muted-foreground">Upload and manage course materials</p>
      </div>

      {/* Upload Section */}
      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Curriculum
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="curriculum">Select PDF or Document</Label>
            <Input
              id="curriculum"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          )}
        </div>
      </Card>

      {/* Curriculum List */}
      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Uploaded Curriculum
        </h2>

        <div className="space-y-3">
          {curriculum.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No curriculum uploaded yet
            </p>
          ) : (
            curriculum.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
              >
                <div>
                  <p className="font-medium">{item.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {(item.file_size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Curriculum;
