import { type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { Button } from "~/components/ui/button";
import type { VideoClient } from "@zoom/videosdk";
import "@zoom/videosdk-ui-toolkit/dist/videosdk-ui-toolkit.css";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

const MicButton = (props: { client: MutableRefObject<typeof VideoClient>; isAudioMuted: boolean; setIsAudioMuted: Dispatch<SetStateAction<boolean>> }) => {
  const { client, isAudioMuted, setIsAudioMuted } = props;
  const onMicrophoneClick = async () => {
    const mediaStream = client.current.getMediaStream();
    isAudioMuted ? await mediaStream?.unmuteAudio() : await mediaStream?.muteAudio();
    setIsAudioMuted(client.current.getCurrentUserInfo().muted ?? true);
  };
  return (
    <Button onClick={onMicrophoneClick} variant={"outline"}>
      {isAudioMuted ? <MicOff /> : <Mic />}
    </Button>
  );
};

const CameraButton = (props: {
  client: MutableRefObject<typeof VideoClient>;
  isVideoMuted: boolean;
  setIsVideoMuted: Dispatch<SetStateAction<boolean>>;
  renderVideo: (event: { action: "Start" | "Stop"; userId: number }) => Promise<void>;
}) => {
  const { client, isVideoMuted, setIsVideoMuted, renderVideo } = props;

  const onCameraClick = async () => {
    const mediaStream = client.current.getMediaStream();
    if (isVideoMuted) {
      await mediaStream.startVideo();
      setIsVideoMuted(false);
      await renderVideo({ action: "Start", userId: client.current.getCurrentUserInfo().userId });
    } else {
      await mediaStream.stopVideo();
      setIsVideoMuted(true);
      await renderVideo({ action: "Stop", userId: client.current.getCurrentUserInfo().userId });
    }
  };

  return (
    <Button onClick={onCameraClick} variant={"outline"}>
      {isVideoMuted ? <Video /> : <VideoOff />}
    </Button>
  );
};

export { MicButton, CameraButton };
