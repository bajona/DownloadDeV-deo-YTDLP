import { ArrowLeft, Terminal, Info, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface InstallationGuideProps {
  onBackToDownload: () => void;
}

export default function InstallationGuide({ onBackToDownload }: InstallationGuideProps) {
  const { toast } = useToast();

  const commands = {
    step1: "Set-ExecutionPolicy Bypass -Scope Process",
    step2: `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`,
    step3: "choco install ffmpeg yt-dlp",
    verification: "yt-dlp --version"
  };

  const copyCommand = (command: string, stepName: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "Copiado!",
      description: `Comando do ${stepName} copiado para a área de transferência.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Installation Header */}
      <div className="text-center pb-6 border-b border-slate-200">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Terminal className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Instalação do yt-dlp</h2>
        <p className="text-slate-600 mb-3">Quer rodar esse código diretamente em sua máquina local sem depender de nenhum site mais?</p>
        <p className="text-slate-500 text-sm">Siga os passos abaixo para instalar o yt-dlp e suas dependências</p>
      </div>

      {/* Prerequisites */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          <h3 className="font-medium mb-1">Pré-requisitos</h3>
          <p className="text-sm">Execute o PowerShell como <strong>Administrador</strong> para instalar as ferramentas necessárias.</p>
        </AlertDescription>
      </Alert>

      {/* Installation Steps */}
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-800 mb-2">Definir Política de Execução</h3>
              <p className="text-sm text-slate-600 mb-3">Primeiro, permita a execução de scripts no PowerShell:</p>
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">PowerShell (Administrador)</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand(commands.step1, "Passo 1")}
                    className="text-slate-400 hover:text-slate-300 h-auto p-1"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copiar
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm block">{commands.step1}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-800 mb-2">Instalar Chocolatey</h3>
              <p className="text-sm text-slate-600 mb-3">Instale o gerenciador de pacotes Chocolatey:</p>
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">PowerShell (Administrador)</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand(commands.step2, "Passo 2")}
                    className="text-slate-400 hover:text-slate-300 h-auto p-1"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copiar
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm block leading-relaxed break-all">
                  {commands.step2}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-800 mb-2">Instalar yt-dlp e FFmpeg</h3>
              <p className="text-sm text-slate-600 mb-3">Instale o yt-dlp e suas dependências:</p>
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">PowerShell (Administrador)</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand(commands.step3, "Passo 3")}
                    className="text-slate-400 hover:text-slate-300 h-auto p-1"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copiar
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-sm block">{commands.step3}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification */}
      <Alert className="bg-emerald-50 border-emerald-200">
        <CheckCircle className="h-4 w-4 text-emerald-500" />
        <AlertDescription className="text-emerald-700">
          <h3 className="font-medium mb-1">Verificação da Instalação</h3>
          <p className="text-sm mb-2">Após a instalação, você pode verificar se tudo está funcionando com:</p>
          <div className="flex items-center space-x-2">
            <code className="text-sm bg-emerald-100 px-2 py-1 rounded font-mono text-emerald-800">
              {commands.verification}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCommand(commands.verification, "verificação")}
              className="text-emerald-600 hover:text-emerald-700 h-auto p-1"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* BAT File Creation */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">4</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-800 mb-2">Criar Arquivo .bat para Downloads Rápidos</h3>
            <p className="text-sm text-slate-600 mb-3">Para facilitar o uso, crie um arquivo .bat na área de trabalho:</p>
            
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                <p className="mb-2"><strong>1.</strong> Clique com o botão direito na área de trabalho</p>
                <p className="mb-2"><strong>2.</strong> Selecione "Novo" → "Documento de Texto"</p>
                <p className="mb-2"><strong>3.</strong> Renomeie o arquivo para "Baixar_Video.bat" (certifique-se de mudar a extensão de .txt para .bat)</p>
                <p className="mb-3"><strong>4.</strong> Clique com o botão direito no arquivo e selecione "Editar"</p>
                <p className="mb-2"><strong>5.</strong> Cole o código abaixo:</p>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Conteúdo do arquivo .bat</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand(`@echo off
set /p video_url="Digite a URL do vídeo: "
echo Baixando o vídeo de %video_url%...
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 %video_url%
echo.
echo Download concluido ou houve um erro. Pressione qualquer tecla para sair.
pause > nul`, "arquivo .bat")}
                    className="text-slate-400 hover:text-slate-300 h-auto p-1"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copiar
                  </Button>
                </div>
                <code className="text-green-400 font-mono text-xs block whitespace-pre-wrap">
{`@echo off
set /p video_url="Digite a URL do vídeo: "
echo Baixando o vídeo de %video_url%...
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 %video_url%
echo.
echo Download concluido ou houve um erro. Pressione qualquer tecla para sair.
pause > nul`}
                </code>
              </div>

              <div className="text-sm text-slate-600">
                <p className="mb-2"><strong>6.</strong> Salve o arquivo e feche o editor</p>
                <p className="mb-2"><strong>7.</strong> Agora você pode clicar duas vezes no arquivo "Baixar_Video.bat" sempre que quiser baixar um vídeo!</p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-700">
                  <p className="text-sm"><strong>Dica:</strong> O arquivo .bat perguntará pela URL do vídeo e fará o download automaticamente para a pasta onde o arquivo está localizado.</p>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Download */}
      <div className="text-center pt-4">
        <Button onClick={onBackToDownload} className="bg-blue-600 hover:bg-blue-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Download
        </Button>
      </div>
    </div>
  );
}
