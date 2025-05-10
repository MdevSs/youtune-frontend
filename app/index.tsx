"use client"
import Feather from '@expo/vector-icons/Feather';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import type React from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, GestureResponderEvent, Image, ImageBackground, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from 'react-native-simple-toast';


interface download {
    url: string,
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  load: boolean;
  play: boolean;
  duration: string;
    downloaded: boolean;
}
// const API=["https://youtune-backend.flyra.tech/download/music-info?url=", "https://youtune-backend.flyra.tech/download/music?url="];
const API=["http://192.168.15.157:3000/download/music-info?url=", "http://192.168.15.157:3000/download/music?url="];
export default function Home() {
    const { height } = Dimensions.get('window');
    const [firstRender, setFirstRender] = useState(true);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [load, setLoad] = useState(false);
    const [downloadLoad, setDownloadLoad] = useState(false);
    const [url, setUrl] = useState("")
    const [newDownload, setNewDownload] = useState<download>({
        url: "",
        id: "",
        title: "",
        artist: "",
        thumbnail: "",
        load: false,
        play: false,
        duration: "",
        downloaded: false,
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
        url: encodeURIComponent(url),
        id: downloads.length.toString(),
        title: dados.title,
        artist: dados.artist,
        thumbnail: dados.thumbnail,
        load: false,
        play: false,
        duration: dados.duration,
        downloaded: false,
        })
      }
    }catch(e){
      console.error(e);
    }finally{
      console.log('Finalizou a requisição');
      setLoad(false);
    }
    console.log(newDownload+"\n"+downloads)
    // setDownloads([newDownload, ...downloads]);
  }

  const downloadMusic = async (url:string, title: string) => {
    setDownloadLoad(true);
    console.log(title)
    if(Platform.OS=="web"){
      try {
        const response = await fetch(API[1]+""+url);
    
        if (!response.ok) {
          throw new Error('Erro ao baixar o arquivo');
        }
    
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
    
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = title || "musica.mp3"; // nome do arquivo salvo
        document.body.appendChild(link);
        link.click(); // dispara o download
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl); // libera memória
        setDownloadLoad(false);
        Toast.showWithGravity(
          'Música baixada com sucesso',
          Toast.LONG,
          Toast.TOP,
        );
      } catch (error) {
        console.error('Erro no download:', error);
      }
    } else {  
      try {
        // Solicita permissão para acessar a galeria
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permissão negada para acessar a galeria.');
          return;
        }

        // Define onde o arquivo será salvo primeiro (pasta privada do app)
        const fileUri = FileSystem.documentDirectory + title + ".mp3";

        // Faz o download do arquivo
        const downloadResult = await FileSystem.downloadAsync(
          API[1]+""+url, 
          fileUri);

        if (downloadResult.status !== 200) {
          throw new Error('Falha no download');
        }

        
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri).then(() => Toast.show(
          'Música baixada com sucesso',
          Toast.SHORT,
        ));
        await Sharing.shareAsync(fileUri);

        // (Opcional) Salva em um álbum chamado "Downloads"
        // await MediaLibrary.createAlbumAsync("Downloads", asset, false);

        console.log('Arquivo saaslvo com sucesso na galeria!');
        setDownloadLoad(false);
        
      } catch (error) {
        console.error('Erro ao baixar e salvar o arquivo:', error);
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
      setDownloads((prev) => {
        const Downloads = [newDownload, ...prev];


        if(Downloads.length > 5) {
            return Downloads.slice(0,5);
        }

        return Downloads;
        

    });
    }
  }, [newDownload])


  const deleteDownload = async (id: string) => {
    setDownloads(downloads.filter((d) => d.id !== id))
    if(sound){
        await sound.stopAsync();
    }
  }

  const playSound = async (url: string, id: string) => {
        stopSound();
        setDownloads((prev) =>
            prev.map((item) =>
            item.id === id ? { ...item, load: true } : item
            )
        );
        const { sound } = await Audio.Sound.createAsync({
          uri: API[1]+""+url,
        });
        setSound(sound);
        
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) {
                return;
            }else{
                setDownloads((prev) =>
                    prev.map((item) =>
                    item.id === id ? { ...item, load: false } : item
                    )
                );
            }
          
            if (status.isPlaying) {
              setDownloads((prev) =>
                prev.map((item) =>
                item.id === id ? { ...item, play: true } : item
                )
            );
            } else {
                setDownloads((prev) =>
                    prev.map((item) =>
                    item.id === id ? { ...item, play: false } : item
                    )
                );
            }
          });
  }

  const stopSound = async (url?: string, id?: string)=> {
    if (sound) {
        await sound.stopAsync();
    } 
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.titleRow}>
            <Image style={{width:40, height:40}} source={require("../assets/images/icon.png")}/>
            <Text style={styles.headerTitle}>YouTube Music Downloader</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              placeholder="Paste YouTube link here"
              value={url}
              onChangeText={setUrl}
              placeholderTextColor="#ffffff80"
              style={styles.input}
            />
            <Pressable onPress={handleSubmit} style={styles.searchPressable}>
              <Feather name="search" size={24} color="white" />
              <Text style={styles.PressableText}>Search</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {load && <ActivityIndicator style={{ marginTop: 30 }} color="#FAFAFA" />}

      <View style={styles.content}>
        <View style={styles.musicBox}>
          <Text style={styles.sectionTitle}>
            <Feather name="music" size={24} color="white" /> Your Music
          </Text>
          <View style={styles.separator} />
          <Modal
              animationType="slide"
              backdropColor={"rgba(16, 16, 16, 0.09)"}
              visible={downloadLoad}
              onRequestClose={() => {
                setDownloadLoad(!downloadLoad);
              }}
              style={{backgroundColor: "rgb(18, 18, 18)", padding: '200px'}}
          >
              <View style={{flex: 1, alignItems:'center', justifyContent: 'center',}}>
                <View style={{ backgroundColor: 'rgb(29, 27, 27)', width: 150, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 10, borderRadius: 20}}>
                  <ActivityIndicator color="#FAFAFA"/>
                  <Text style={{color:"#FAFAFA"}}>Baixando</Text>
                </View>
              </View>
          </Modal>
          <ScrollView style={{ maxHeight: height - 200 }}>
            {downloads.length === 0 ? (
              <Text style={styles.emptyText}>
                No downloads yet. Paste a YouTube link above to get started.
              </Text>
            ) : (
              <View style={{ gap: 16 }}>
                {downloads.map((download) => (
                  <View key={download.id} style={styles.downloadItem}>
                    <View style={styles.downloadRow}>
                      <View style={{overflow: 'hidden', borderRadius: 10}}>
                            <ImageBackground
                            source={{ uri: download.thumbnail }}
                            style={styles.thumbnail}
                            >
                            {download.load && <View style={{flex: 1, backgroundColor: 'rgba(5,5,5,0.6)', position: 'relative', zIndex: 2, borderRadius: 10}}>
                                <ActivityIndicator style={{position: 'absolute', top: 12, left: 13}} color="white"/>
                            </View>}
                            </ImageBackground>
                      </View>
                      {

                      }
                      <View style={styles.downloadText}>
                        <Text style={styles.title}>{download.title}</Text>
                        <Text style={styles.artist}>{download.artist}</Text>
                        {!download.downloaded && (
                          <View style={{paddingTop: 15}}>
                              {!download.play && <Pressable onPress={() => playSound(download.url, download.id)}>
                                  <Feather name="play" size={24} color="white" />
                              </Pressable>}
                              {download.play && <Pressable onPress={() => stopSound(download.url, download.id)}>
                              <Feather name="pause" size={24} color="white" />
                            </Pressable>}
                          </View>
                        )}
                      </View>
                      <View style={styles.actionPressables}>
                        <Pressable onPress={() => downloadMusic(download.url, download.title)} style={styles.iconPressable}>
                          <Feather name="download" size={24} color="white" />
                        </Pressable>
                        <Pressable
                          onPress={() => deleteDownload(download.id)}
                          style={[styles.iconPressable, styles.trashPressable]}
                        >
                          <Feather name="trash-2" size={24} color="white" />
                        </Pressable>
                      </View>
                    </View>
                    {download.downloaded && (
                      <View style={styles.downloadFooter}>
                        <Text style={styles.downloadFooterText}>Downloaded • {download.duration}</Text>
                        <Text style={styles.downloadFooterText}>Tap to play</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Enjoy our App.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'linear-gradient(to bottom, rgb(224, 27, 73), rgb(182, 12, 12))', 
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%'
  },
  headerInner: {
    paddingTop:15,
    marginHorizontal: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    color: 'white',
    borderRadius: 4,
  },
  searchPressable: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  PressableText: {
    color: 'white',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  musicBox: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
    color: 'rgba(255,255,255,0.7)',
  },
  downloadItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
  },
  downloadRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    zIndex: 0
  },
  downloadText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '500',
    color: 'white',
  },
  artist: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  progressText: {
    fontSize: 10,
    marginTop: 4,
    color: 'rgba(255,255,255,0.7)',
  },
  actionPressables: {
    flexDirection: 'column',
    gap: 8,
  },
  iconPressable: {
    height: 32,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashPressable: {
    // backgroundColor: 'rgba(255,0,0,0.1)',
  },
  downloadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  downloadFooterText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});