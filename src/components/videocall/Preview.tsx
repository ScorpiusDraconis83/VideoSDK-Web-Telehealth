/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import ZoomVideo, { LocalAudioTrack, LocalVideoTrack, TestMicrophoneReturn, TestSpeakerReturn } from '@zoom/videosdk'
import { useEffect, useRef, useState } from "react";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { Button } from "~/components/ui/button";
import mobileCheck from "../../utils/mobilecheck";
import { Mic, MicOff, Video, VideoOff, Volume, Volume1, Volume2, ChevronRight, CheckIcon, Image, StopCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "~/components/ui/dropdown-menu";
//   import VolumeSlider from '../ui/slider';
  import BeachPhoto from './images/photo.jpg'

  interface MyLocalAudioTrack extends LocalAudioTrack {
    isAudioStarted: boolean;
    tester: any
  }

  interface MyLocalVideoTrack extends LocalVideoTrack {
    isVideoStarted: boolean;
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Preview = ({setCloseToolkit}: any, ) => {
    
  const hasMounted = useRef(false);
  const [videoDevices, setVideoDevices] = useState<any[]>();
  const [audioInDevices, setAudioInDevices] = useState<any[]>();
  const [audioOutDevices, setAudioOutDevices] = useState<any[]>();
  const [currentCamera, setCurrentCamera] = useState<string>('');
  const [currentMicrophone, setCurrentMicrophone] = useState<string>('');
  const [microphoneTester, setMicrophoneTester] = useState<TestMicrophoneReturn>();
  const [speakerTester, setSpeakerTester] = useState<TestSpeakerReturn>();
  const [speakerPlaying, setSpeakerPlaying] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string>('');
  const [currentBackground, setCurrentBackground] = useState<string>('');
  const [localAudioTrack, setLocalAudioTrack] = useState({} as MyLocalAudioTrack);
  const [localVideoTrack, setLocalVideoTrack] = useState({} as MyLocalVideoTrack);
  const [localSpeakerTrack, setLocalSpeakerTrack] = useState({} as MyLocalAudioTrack);
  const [mobileDevice, setMobileDevice] = useState(false);
  const [audioOnToggle, setAudioOnToggle] = useState(false);
  const [videoOnToggle, setVideoOnToggle] = useState(false);
  const [volumeBtn, setVolumeBtn] = useState(2);
  const [animation, setAnimation] = useState<any>();

  const startCamera = async (background?: string, cameraId?: string) => {
    
    let devices;
    let cameraDevices;
    let videoTrack;

    if (background) await localVideoTrack.stop();

    if (mobileDevice) {
        cameraDevices = [{
            label: 'Front Camera',
            deviceId: 'user'
        },
        {
            label: 'Back Camera',
            deviceId: 'environment'
        }]
    }
    else {
      devices = await ZoomVideo.getDevices();
      cameraDevices = devices.filter((device) => {
          return device.kind === 'videoinput';
        });

      videoTrack = ZoomVideo.createLocalVideoTrack(cameraId ?? cameraDevices[0]?.deviceId ?? '');
      setCurrentCamera(cameraId ?? cameraDevices[0]?.deviceId ?? '');
    }
    
    setVideoDevices(cameraDevices);

    if (videoTrack) {
      setLocalVideoTrack(videoTrack as MyLocalVideoTrack);
      await videoTrack.start(document.querySelector('#local-preview-video')!, {imageUrl: background ?? ''});
      setCurrentBackground(background ?? '');
      setVideoOnToggle(true);
    }
  };

  const startMicrophone = async (microphoneId?: string) => {
     const devices = await ZoomVideo.getDevices();
     const microphoneDevices = devices.filter((device) => {
         return device.kind === 'audioinput'
       });
     const audioTrack = ZoomVideo.createLocalAudioTrack(microphoneId ?? microphoneDevices[0]?.deviceId ?? '');

     setCurrentMicrophone(microphoneId ?? microphoneDevices[0]?.deviceId ?? '');
     setAudioInDevices(microphoneDevices);

     if (audioTrack) {
      setLocalAudioTrack(audioTrack as MyLocalAudioTrack);
      await audioTrack.start();
      const inputLevelElm: any = document.querySelector("#mic-input-level");
      let tester = audioTrack.testMicrophone({
        microphoneId: currentMicrophone ?? '',
        onAnalyseFrequency: (v) => {
          if (inputLevelElm) inputLevelElm.value = v;
        },
      });
      setMicrophoneTester(tester);
      setAudioOnToggle(true);

     }
  };

  const startSpeaker = async (speakerId?: string) => {
    const devices = await ZoomVideo.getDevices();
     const speakerDevices = devices.filter((device) => {
         return device.kind === 'audiooutput'
       });
    const speakerTrack = ZoomVideo.createLocalAudioTrack(speakerId ?? speakerDevices[0]?.deviceId ?? '');

    setCurrentSpeaker(speakerId ?? speakerDevices[0]?.deviceId ?? '');
    setAudioOutDevices(speakerDevices);

    if (speakerTrack) {
        setLocalSpeakerTrack(speakerTrack as MyLocalAudioTrack);
        await speakerTrack.start();
    }
  };

  const switchCamera = async (cameraId: string) => {
    await localVideoTrack.switchCamera(cameraId);
    setCurrentCamera(cameraId);
  };

  const switchMicrophone = async (microphoneId: string) => {
    if (localAudioTrack.tester.isRunning) microphoneTester?.stop();
    if (localAudioTrack.isAudioStarted) await localAudioTrack.stop();
    await startMicrophone(microphoneId);
  };

  const switchSpeaker = async (speakerId: string) => {
    if (localSpeakerTrack.tester.isRunning) speakerTester?.stop();
    if (localSpeakerTrack.isAudioStarted) await localSpeakerTrack.stop();
    await startSpeaker(speakerId);
  };

  const toggleCamera = async () => {
    if (videoOnToggle) {
        if (localVideoTrack.isVideoStarted) await localVideoTrack.stop();
        setVideoOnToggle(false);
    } else {
        await localVideoTrack.start(document.querySelector('#local-preview-video')!, {imageUrl: currentBackground ?? ''});
        setVideoOnToggle(true);
    }
  };
  const toggleMicrophone = async () => {
    if (audioOnToggle) {
        const inputLevelElm: any = document.querySelector("#mic-input-level");
        if (inputLevelElm) inputLevelElm.value = 0;
        microphoneTester?.stop();
        if (localAudioTrack.isAudioStarted) await localAudioTrack.stop();
        setAudioOnToggle(false);
    } else {
        await localAudioTrack.start();
        testMicrophone();
        setAudioOnToggle(true);
    }
  };

  const testMicrophone = () => {
    const inputLevelElm: any = document.querySelector("#mic-input-level");
    let tester = localAudioTrack.testMicrophone({
        microphoneId: currentMicrophone ?? '',
        onAnalyseFrequency: (v) => {
          if (inputLevelElm) inputLevelElm.value = v;
        },
      });
      setMicrophoneTester(tester);
  };

  const animateSpeaker = (i: number) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            setVolumeBtn(i);
            resolve();
        }, 100);
    });
  };

  const playSpeaker = async () => {
    let tester = localSpeakerTrack.testSpeaker({speakerId: currentSpeaker});

    let animationId = setInterval( async () => {
        for (let i = 0; i < 3; i++) await animateSpeaker(i);
      }, 1000); 
    
    setSpeakerPlaying(true);
    setSpeakerTester(tester);
    setAnimation(animationId);
  };

  const stopSpeaker = () => {
    if (localSpeakerTrack.tester.isRunning) speakerTester?.stop();
    setSpeakerPlaying(false);
    clearInterval(animation)
  };

  const checkMobile = () => {
    if (mobileCheck()) setMobileDevice(true);
    console.log("is mobile browser:", mobileCheck());
  };

  const startPreview = async () => {
    checkMobile();
    await startCamera();
    await startMicrophone();
    await startSpeaker();
  };

  useEffect(() => {
    if (!hasMounted.current) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      startPreview()!;
    }
    return () => { hasMounted.current = true; }
  }, []);

  return (
    <div id="preview" className="mb-8 mt-8 flex flex-1 self-center preview-video-container">
       {/* @ts-expect-error html component */} 
       <video-player-container style={{background: '#403f3f', border: 'solid 12px #403f3f', borderRadius: '12px'}}>
       
           {/* @ts-expect-error html component */}
          <video-player id="local-preview-video"></video-player>
          {/* @ts-expect-error html component */}
       </video-player-container>

       <div className='preview-controls-container'>
      
        <div className='preview-control'>
         <div className='btn-drop-container'>
          <Button variant={"outline"} title="microphone" className='preview-btn' onClick={toggleMicrophone}>
               {!audioOnToggle ? <MicOff color="white"/> : <Mic color="white"/>}
            </Button>
  
           <div style={{marginLeft: '10px'}}>
           <DropdownMenu>
             <DropdownMenuTrigger>
               <Button variant="outline" title="Select Microphone">
                 <ChevronRight />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent>
               <DropdownMenuLabel>Select Microphone</DropdownMenuLabel>
               <DropdownMenuSeparator />
              {(audioInDevices && audioInDevices.length > 0) && audioInDevices.map((mic: MediaDeviceInfo) => {
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  return <DropdownMenuItem key={mic.deviceId} onClick={()=>{switchMicrophone(mic.deviceId)}}>
                      {mic.label} {(currentMicrophone === mic.deviceId) && <CheckIcon />}
                      </DropdownMenuItem>
                  })}
             </DropdownMenuContent>
            </DropdownMenu>
           </div>
           </div>
              
           <div>
             <progress id="mic-input-level" max="100" value="0"></progress>
           </div>
          </div>
      
          <div className='preview-control'>
         <div className='btn-drop-container'>
            <Button variant={"outline"} title="camera" className='preview-btn' onClick={toggleCamera}>
              {!videoOnToggle ? <VideoOff color="white"/> : <Video color="white"/>}
            </Button>
              
              <div style={{marginLeft: '10px'}}>
              <DropdownMenu >
             <DropdownMenuTrigger>
               <Button variant="outline" title="Select Camera">
                 <ChevronRight />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent>
               <DropdownMenuLabel>Select Camera</DropdownMenuLabel>
               <DropdownMenuSeparator />
               {(videoDevices && videoDevices.length > 0) && videoDevices.map((camera: MediaDeviceInfo) => {
                  return (
                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                     <DropdownMenuItem key={camera.deviceId} onClick={()=>{switchCamera(camera.deviceId)}}>
                      {camera.label} {(currentCamera === camera.deviceId) && <CheckIcon />}
                      </DropdownMenuItem>
                  )
                  })}
             </DropdownMenuContent>
            </DropdownMenu>
              </div>
  
            {!mobileDevice && <div>
            <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant="outline" title="Select Virtual Background">
                <Image />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Select Virtual Background</DropdownMenuLabel>
                <DropdownMenuSeparator />
                { // eslint-disable-next-line @typescript-eslint/no-floating-promises}
                <DropdownMenuItem key={0} onClick={()=>{startCamera('', currentCamera)}}>{'None'}{(currentBackground === '') && <CheckIcon />}</DropdownMenuItem>
                }
                { // eslint-disable-next-line @typescript-eslint/no-floating-promises}
                <DropdownMenuItem key={1} onClick={()=>{startCamera('blur', currentCamera)}}>{'Blur'}{(currentBackground === 'blur') && <CheckIcon />}</DropdownMenuItem>
                }
                { // eslint-disable-next-line @typescript-eslint/no-floating-promises}
                <DropdownMenuItem key={2} onClick={()=>{startCamera(BeachPhoto.src, currentCamera)}}>{'Beach'}{(currentBackground === BeachPhoto.src) && <CheckIcon />}</DropdownMenuItem>
                }
            </DropdownMenuContent>
            </DropdownMenu>
            </div>}
              </div>
          </div>
            
          <div className='preview-control'>
         <div className='btn-drop-container'> 
            <Button variant={"outline"} title="speaker" className='preview-btn' onClick={playSpeaker} disabled={speakerPlaying}>
                {(volumeBtn === 0) ? <Volume color="white"/> : 
                    (volumeBtn === 1) ?  <Volume1 color="white"/> :  <Volume2 color="white"/> }
              </Button>
              
              <div style={{marginLeft: '10px'}}>
              <DropdownMenu>
               <DropdownMenuTrigger disabled={speakerPlaying}>
                 <Button variant="outline" title="Select Speaker">
                   <ChevronRight />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                 <DropdownMenuLabel>Select Speaker</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {(audioOutDevices && audioOutDevices.length > 0) && audioOutDevices.map((speaker: MediaDeviceInfo) => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    return <DropdownMenuItem key={speaker.deviceId} onClick={()=>{switchSpeaker(speaker.deviceId)}}>
                        {speaker.label} {(currentSpeaker === speaker.deviceId) && <CheckIcon />}
                        </DropdownMenuItem>
                    })}
               </DropdownMenuContent>
              </DropdownMenu>
              </div>
  
              { speakerPlaying && <DropdownMenu>
                                      <DropdownMenuTrigger onClick={stopSpeaker}>
                                      <Button variant="outline" title="Stop Speaker"><StopCircle/></Button>
                                     </DropdownMenuTrigger>
                                     </DropdownMenu>}
              </div>
              
              {/* dont need the volume slider but the option is available for parity with UIkit previw */}
              {/* <div style={{marginTop: '10px'}}>
                <VolumeSlider/>
              </div> */}
            </div>
           
         </div>
       </div>
    );
};

export default Preview;
