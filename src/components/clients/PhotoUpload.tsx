"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function PhotoUpload({ value, onChange, disabled }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setIsUploading(true);

    try {
      // Criar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload para Supabase Storage
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/client-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da foto");
      }

      const { url } = await response.json();
      onChange(url);
      toast.success("Foto carregada com sucesso!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload da foto");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {preview ? (
        <div className="relative w-32 h-32 mx-auto">
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="w-full border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center text-muted-foreground text-sm transition-all hover:bg-primary/10 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-primary/60 animate-spin" />
            ) : (
              <User className="h-8 w-8 text-primary/60" />
            )}
          </div>
          <span className="font-medium">
            {isUploading ? "Carregando..." : "Carregar foto"}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            JPG, PNG até 2MB
          </span>
        </button>
      )}
    </div>
  );
}
