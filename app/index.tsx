"use client"

import type React from "react"
import * as FileSystem from 'expo-file-system';
import { useState, useEffect } from "react"
import { Download, Search, Music, Pause, Play, Trash, Youtube } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Progress } from "~/components/ui/progress"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Separator } from "~/components/ui/separator"
import { GestureResponderEvent, Platform, TextInput } from "react-native";
import { ActivityIndicator } from "react-native";



interface download {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  progress: number;
  downloaded: boolean;
  duration: string;
}
const API=["https://youtune-backend.flyra.tech/download/music-info?url=", "https://youtune-backend.flyra.tech/download/music?url="];
// const API=["http://localhost:3000/download/music-info?url=", "http://localhost:3000/download/music?url="];
export default function Home() {
  const [firstRender, setFirstRender] = useState(true);
  const [load, setLoad] = useState(false);
  const [url, setUrl] = useState("")
  const [newDownload, setNewDownload] = useState<download>({
    id: "",
    title: "",
    artist: "",
    thumbnail: "",
    progress: 0,
    downloaded: false,
    duration: "",
  });
  const [downloads, setDownloads] = useState<download[]>([])

  const handleSubmit = async (e: GestureResponderEvent) => {
    setLoad(true);
    try{
      const response = await fetch(API[0]+""+encodeURIComponent(url),
              {
                  method: 'GET',
              })
      const dados = await response.json();
            
      if(dados){
        setNewDownload({
        id: downloads.length.toString(),
        title: dados.title,
        artist: dados.artist,
        thumbnail: dados.thumbnail,
        progress: 0,
        downloaded: false,
        duration: dados.duration,
        })
      }
    }catch(e){
      console.error(e);
    }finally{
      console.log('Finalizou a requisição');
      setLoad(false);
    }
    console.log(newDownload+"\n"+downloads)
    setDownloads([newDownload, ...downloads]);
  }

  const downloadMusic = async () => {
    if(Platform.OS=="web"){
      try {
        const response = await fetch(API[1]+""+encodeURIComponent(url));
    
        if (!response.ok) {
          throw new Error('Erro ao baixar o arquivo');
        }
    
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
    
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = newDownload.artist || "musica.mp3"; // nome do arquivo salvo
        document.body.appendChild(link);
        link.click(); // dispara o download
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl); // libera memória
      } catch (error) {
        console.error('Erro no download:', error);
      }
    } else {  
      try{
          
          
          const fileUri = FileSystem.documentDirectory + newDownload.title;

          const downloadRes = await FileSystem.downloadAsync(
            API[1]+''+encodeURIComponent(url),
            fileUri
          );

          console.log('Arquivo baixado em:', downloadRes.uri);
        }catch(e) {
            console.error(e)
        }finally{
            console.log('Finalizou a requisição');
        }
    }
  }

  useEffect(()=>{
    if(firstRender)
    {
      setFirstRender(false);
      return;
    }
      

    if (newDownload.id != "") {
      setDownloads((prev) => [newDownload, ...prev]);
    }
  }, [newDownload])

  const deleteDownload = (id: string) => {
    setDownloads(downloads.filter((d) => d.id !== id))
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-red-500 to-red-700 text-white">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Youtube className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">YouTube Music Downloader</h1>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
            <TextInput
              placeholder="Paste YouTube link here"
              value={url}
              onChangeText={setUrl}
              className="p-4 flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button onPress={handleSubmit} className="bg-red-600 hover:bg-red-700">
              <Search className="h-5 w-5 mr-1" />
              <span className="sr-only sm:not-sr-only">Search</span>
            </Button>
          </form>
        </div>
      </div>
      {load && <ActivityIndicator className="mt-[30px]" color='#FAFAFA' />}
      <div className="container mx-auto px-4 py-4 flex-1">
        <div className="bg-black/40 rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Music className="h-5 w-5" /> Your Music
          </h2>
          <Separator className="bg-white/20 mb-4" />

          <ScrollArea className="h-[calc(100vh-200px)]">
            {downloads.length === 0 ? (
              <div className="text-center py-8 text-white/70">
                No downloads yet. Paste a YouTube link above to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {downloads.map((download) => (
                  <div key={download.id} className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={download.thumbnail}
                        alt={download.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{download.title}</h3>
                        <p className="text-sm text-white/70 truncate">{download.artist}</p>
                        {!download.downloaded && (
                          <div className="mt-1">
                            <Progress value={download.progress} className="h-1.5 bg-white/20" />
                            <p className="text-xs mt-1 text-white/70">{download.progress}% complete</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                          <Button size="icon" onPress={downloadMusic} variant="ghost" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-300 hover:text-red-100 hover:bg-red-500/20"
                          onPress={() => deleteDownload(download.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {download.downloaded && (
                      <div className="flex justify-between items-center mt-2 text-xs text-white/70">
                        <span>Downloaded • {download.duration}</span>
                        <span>Tap to play</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <footer className="bg-black/80 py-3 px-4 text-center text-sm text-white/70">
        <p>This is a UI demo. Actual YouTube downloading may be subject to terms of service.</p>
      </footer>
    </main>
  )
}
