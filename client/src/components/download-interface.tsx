import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Link as LinkIcon, X, CheckCircle, AlertCircle, TriangleAlert, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Download as DownloadType } from "@shared/schema";

export default function DownloadInterface() {
  const [videoUrl, setVideoUrl] = useState("");
  const [currentDownloadId, setCurrentDownloadId] = useState<number | null>(null);
  const { toast } = useToast();

  // Check if yt-dlp is available
  const { data: ytdlpStatus } = useQuery<{ available: boolean }>({
    queryKey: ["/api/check-ytdlp"],
  });

  // Poll download status when there's an active download
  const { data: downloadStatus } = useQuery<DownloadType>({
    queryKey: ["/api/downloads", currentDownloadId],
    enabled: currentDownloadId !== null,
    refetchInterval: (query) => {
      // Stop polling if download is completed or failed
      const data = query.state.data as DownloadType;
      if (data?.status === 'completed' || data?.status === 'error') {
        return false;
      }
      // Poll every 2 seconds during active download
      return 2000;
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/downloads", { url });
      return response.json();
    },
    onSuccess: (download: DownloadType) => {
      setCurrentDownloadId(download.id);
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao iniciar o download. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    if (!ytdlpStatus?.available) {
      toast({
        title: "yt-dlp não encontrado",
        description: "Acesse a aba 'Instalação do yt-dlp' para instalar a ferramenta.",
        variant: "destructive",
      });
      return;
    }

    downloadMutation.mutate(videoUrl);
  };

  const handleClearInput = () => {
    setVideoUrl("");
    setCurrentDownloadId(null);
  };

  const handleDownloadFile = () => {
    if (currentDownloadId) {
      window.open(`/api/downloads/${currentDownloadId}/file`, '_blank');
    }
  };

  const copyCommand = () => {
    const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 ${videoUrl || '%URL_DO_VIDEO%'}`;
    navigator.clipboard.writeText(command);
    toast({
      title: "Copiado!",
      description: "Comando copiado para a área de transferência.",
    });
  };

  const isDownloading = downloadStatus?.status === 'downloading' || downloadMutation.isPending;
  const isCompleted = downloadStatus?.status === 'completed';
  const hasError = downloadStatus?.status === 'error';

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <div className="space-y-3">
        <Label htmlFor="videoUrl" className="text-base font-medium">URL do Vídeo</Label>
        <div className="relative">
          <Input
            id="videoUrl"
            type="url"
            placeholder="Cole aqui a URL do vídeo (YouTube, Instagram, TikTok, etc.)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="pr-10 py-3 text-base"
            disabled={isDownloading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <LinkIcon className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Suporte para YouTube, Instagram, TikTok, Twitter e 1000+ plataformas
          </p>
          {videoUrl && (
            <button 
              onClick={() => setVideoUrl("")}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Fair Use Disclaimer */}
      <Alert className="bg-amber-50 border-amber-200">
        <TriangleAlert className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-800">
          <p className="font-medium mb-1">Uso Responsável</p>
          <p className="text-sm">
            <strong>Lembre-se:</strong> baixar vídeos do YouTube deve respeitar os direitos autorais dos criadores. 
            Para entender o que é o Uso Aceitável (Fair Use) e quais são as permissões e restrições de uso, 
            consulte as diretrizes oficiais do YouTube.
          </p>
        </AlertDescription>
      </Alert>

      {/* Download Button */}
      <div className="flex space-x-3">
        <Button
          onClick={handleDownload}
          disabled={isDownloading || !videoUrl.trim()}
          className="flex-1 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
          size="lg"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Baixando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Baixar Vídeo
            </>
          )}
        </Button>
        {(videoUrl || currentDownloadId) && (
          <Button
            variant="outline"
            onClick={handleClearInput}
            title="Limpar e resetar"
            disabled={isDownloading}
            size="lg"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress Section */}
      {isDownloading && downloadStatus && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-5 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-slate-700">Progresso do Download</span>
              <div className="flex items-center space-x-2">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-lg font-semibold text-blue-600">{downloadStatus.progress || 0}%</span>
              </div>
            </div>
            <Progress value={downloadStatus.progress || 0} className="mb-3 h-2" />
            <p className="text-sm text-slate-600 font-medium">
              {(downloadStatus.progress || 0) < 30 && "🔍 Obtendo informações do vídeo..."}
              {(downloadStatus.progress || 0) >= 30 && (downloadStatus.progress || 0) < 70 && "⬇️ Baixando vídeo..."}
              {(downloadStatus.progress || 0) >= 70 && (downloadStatus.progress || 0) < 95 && "⚙️ Processando arquivo..."}
              {(downloadStatus.progress || 0) >= 95 && "✨ Finalizando..."}
            </p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      <div className="space-y-2">
        {isCompleted && (
          <Alert className="bg-emerald-50 border-emerald-200">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <AlertDescription className="text-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Download concluído com sucesso!</p>
                  <p className="text-sm mt-1">Arquivo pronto para download</p>
                </div>
                <Button
                  size="sm"
                  onClick={handleDownloadFile}
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Baixar Arquivo
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {hasError && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Erro no download</p>
              <p className="text-xs mt-1">{downloadStatus?.errorMessage || "URL inválida ou yt-dlp não encontrado."}</p>
            </AlertDescription>
          </Alert>
        )}

        {!ytdlpStatus?.available && (
          <Alert className="bg-amber-50 border-amber-200">
            <TriangleAlert className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-800">
              <p className="font-medium">yt-dlp não encontrado</p>
              <p className="text-xs mt-1">Acesse a aba "Instalação do yt-dlp" para instalar a ferramenta.</p>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Command Preview - Only show when there's a URL or during/after download */}
      {(videoUrl || currentDownloadId) && (
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Comando yt-dlp utilizado:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCommand}
              className="text-slate-400 hover:text-slate-300"
            >
              <Copy className="mr-1 h-3 w-3" />
              Copiar
            </Button>
          </div>
          <code className="text-xs text-green-400 font-mono block bg-slate-900 p-3 rounded border">
            yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4{" "}
            <span className="text-blue-400">{videoUrl || '%URL_DO_VIDEO%'}</span>
          </code>
        </div>
      )}

    </div>
  );
}
