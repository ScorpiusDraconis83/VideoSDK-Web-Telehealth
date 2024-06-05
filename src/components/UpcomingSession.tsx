import { type User, type Room } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { LinkIcon } from "lucide-react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import DownloadICSButton from "./DownloadICS";

type RoomData = Room & {
  User_CreatedFor?: User[];
  User_CreatedBy?: User;
};

const UpcomingSession = ({ data }: { data: RoomData }) => {
  const rooms = data;
  const { data: userData } = useSession();
  const isDoctor = userData?.user.role === "doctor";
  const { toast } = useToast();
  const deleteRoom = api.room.delete.useMutation();
  const utils = api.useUtils();

  //convert to minutes to be able to check and conditionally render join session button
  console.log(moment(rooms.time).local().fromNow());

  return (
    <div>
      <div className="min-h-[8rem] w-full min-w-[720px] rounded-lg bg-white shadow-lg">
        <div className="flex items-start gap-4 p-4">
          <div className="flex flex-col rounded-lg border border-blue-600 text-center text-lg">
            <div className="w-full rounded-t-md bg-blue-600 px-3 py-0.5 text-sm uppercase text-white">{rooms.time.toString().slice(4, 7)}</div>
            <div className="text-blue-600">{rooms.time.toString().slice(7, 11)}</div>
          </div>
          <div className="w-full bg-white">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold uppercase tracking-wide text-blue-700">
                {rooms.title}
                {rooms.User_CreatedFor?.[0]
                  ? `, with ${rooms.User_CreatedBy?.id === userData?.user.id ? rooms.User_CreatedFor?.[0].name : rooms.User_CreatedBy?.name}`
                  : ""}
              </h4>
              <Button
                variant={"link"}
                onClick={async () => {
                  const link = `${window.location.origin}/room/`;
                  await navigator.clipboard.writeText(link);
                  toast({ title: "Copied link to clipoard", description: link });
                }}
                className="max-w-full"
              >
                <LinkIcon height={18} strokeWidth={3} />
              </Button>
              {/* <small className="text-sm text-gray-700">{moment(rooms.time).local().fromNow()}</small> */}
            </div>
            <Link className="flex flex-1 text-sm text-blue-600 hover:underline" href={`/room/${rooms.id}`}>
              Join Apointment
              {/* add logic to show join session button if time is in the future by some amount */}
            </Link>
            <p className="mt-3 flex justify-start text-sm text-gray-700">
              {data.createByUserId === userData?.user.id ? (
                data.User_CreatedFor?.[0]?.role === "patient" ? (
                  <Link href={`/patient/${data.User_CreatedFor?.[0].id}`} className="text-gray-500">
                    <p className="text-grey-500 hover:text-blue-500" title="Patient details">{`Patient: ${data.User_CreatedFor?.[0]?.name}`}</p>
                  </Link>
                ) : (
                  <p>{`Doctor: ${data.User_CreatedFor?.[0]?.name}`}</p>
                )
              ) : data.User_CreatedBy?.role === "patient" ? (
                <Link href={`/patient/${data.User_CreatedBy.id}`} className="text-gray-500">
                  <p className="text-grey-500 hover:text-blue-500" title="Patient details">{`Patient: ${data.User_CreatedFor?.[0]?.name}`}</p>
                </Link>
              ) : (
                <p>{`Doctor: ${data.User_CreatedBy?.name}`}</p>
              )}
            </p>
            <div className="flex gap-4">
              {isDoctor ? (
                <Link href={`/viewNotes/${data.id}`}>
                  <Button className="p-0" variant={"link"}>
                    Notes
                  </Button>
                </Link>
              ) : (
                <></>
              )}
              <Link href={`/viewRecordings/${data.id}`}>
                <Button className="p-0" variant={"link"}>
                  Recordings
                </Button>
              </Link>
              {data.time.getTime() > new Date().getTime() ? (
                <DownloadICSButton
                  event={{
                    start: data.time.getTime(),
                    duration: {
                      hours: data.duration,
                    },
                    title: `${data.title}`,
                  }}
                />
              ) : (
                <></>
              )}
              {/* <button onClick={() => deleteRoom.mutate({ id: data.id })}>delete</button> */}
            </div>
          </div>
        </div>
      </div>
    </div>

    // <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-5">
    //   <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
    //     <Link className="flex w-full flex-1 text-sm text-blue-500 hover:underline px-2" href={`/room/${rooms.id}`}>
    //       Join Session
    //     </Link>
    //   </div>
    //   <button
    //     // variant={"destructive"}
    //     onClick={async () => {
    //       toast({ title: "Deleting Room", description: rooms.title });
    //       await deleteRoom.mutateAsync({ id: rooms.id });
    //       await utils.room.invalidate();
    //     }}
    //     title="Cancel appointment"
    //     className="flex w-full flex-1 text-sm text-blue-500 hover:underline px-2"
    //   >
    //    Delete/Cancel Session
    //   </button>
    //   <div className="p-8 flex items-center">
    //       <div className="items-start">
    //       <p className=" pr-4 bg-blue-200 p-2 rounded-lg text-center text-4xl font-bold text-white">{rooms.time.toString().slice(4,11)}</p>
    //       <Link href={`/viewNotes/${rooms.id}`}>
    //         <Button variant={"link"}>Notes</Button>
    //       </Link>
    //       <RecordingModal roomId={rooms.id} />
    //       </div>

    //       <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">

    //     </div>
    //       <div className="ml-4">
    //        <Button
    //     variant={"link"}
    //     onClick={async () => {
    //       const link = `${window.location.origin}/room/${rooms.id}`;
    //       await navigator.clipboard.writeText(link);
    //       toast({ title: "Copied link to clipoard", description: link });
    //     }}
    //     className="max-w-full"
    //   >
    //     <span className="uppercase tracking-wide text-base text-indigo-500 font-semibold">{rooms.title}</span>
    //     <LinkIcon height={18} strokeWidth={3} />
    //   </Button>
    //       <p className="text-sm ">{moment(rooms.time).local().fromNow()}</p>
    //       <p className="mt-2 text-gray-500">{rooms.duration} hour(s)</p>
    //       <p className="mt-2 text-gray-500">Dr. {rooms.User_CreatedBy?.name}, Cardiology Specialist</p>
    //       {/* <Avatar className="ml-4">
    //         <AvatarImage src={data?.user.image as string | undefined} alt="User Avatar" />
    //       </Avatar>               */}
    //         <Link href={`/patient/${rooms.User_CreatedFor?.[0].id}`} className="mt-2 text-gray-500">
    //         <p className="mt-2 text-grey-500 hover:text-blue-500" title='click for patient details'>Patient: {rooms.User_CreatedFor?.[0].name}</p>
    //         </Link>
    //       {/* <p className="mt-2 text-gray-500">Patient: {rooms.User_CreatedFor?.[0].name}</p> */}
    //          {isDoctor && rooms.User_CreatedFor?.[0]?.id ? (
    //   <>
    //     {/* <div className="mb-2 mt-4 flex flex-1 flex-row justify-center">
    //       <Link href={`/viewNotes/${rooms.id}`}>
    //         <Button variant={"link"}>Notes</Button>
    //       </Link>
    //       <div className="w-2"></div>
    //       <RecordingModal roomId={rooms.id} />
    //     </div> */}
    //   </>
    // ) : (
    //   <> </>
    // )}
    //     </div>
    //   </div>
    // </div>
  );
};

export default UpcomingSession;

// - Patient can see
// - Recording
// - Transcript
// - Add to calendar
// - Doctor can also
// - notes
