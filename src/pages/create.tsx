import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import moment from "moment";
import Header from "~/components/ui/header";
import Footer from "~/components/ui/footer";
import EmailInput from "~/components/ui/emailInput";

export default function Home() {
  const createPost = api.room.create.useMutation();
  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState<number>(1);
  const [time, setTime] = useState<string>(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 1000 * 60).toISOString().slice(0, 16));
  const [email, setEmail] = useState<string>("");
  const [emails, setEmails] = useState<string[]>([]);

  return (
    <>
      <Header />
      <div className="flex h-screen w-screen flex-col items-center bg-gray-100">
        <h1 className="my-10 flex text-center text-3xl font-bold leading-none text-gray-700">Schedule Session</h1>
        <Card className="mb-8 flex w-96 flex-col flex-wrap justify-center p-4 shadow-lg">
          <form
            className="flex w-full flex-col"
            onSubmit={async (e) => {
              e.preventDefault();
            }}
          >
            <Label htmlFor="title" className="mb-2">
              Title
            </Label>
            <Input
              id="title"
              className="mb-4"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
            <Label htmlFor="content" className="mb-2">
              Content
            </Label>
            <Input
              id="content"
              className="mb-4"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
            />
            <EmailInput email={email} emails={emails} setEmail={setEmail} setEmails={setEmails} />

            <Label htmlFor="duration" className="mb-2">
              Duration
            </Label>
            <div className="flex">
              <Input
                id="duration"
                type="number"
                className="mb-4 mr-2"
                value={duration}
                onChange={(e) => {
                  setDuration(parseInt(e.target.value));
                }}
              />
              <p className="mb-4 mt-auto flex">hours</p>
            </div>
            <Label htmlFor="time" className="mb-2">
              Time (GMT)
            </Label>
            <div className="flex">
              <Input
                id="time"
                type="datetime-local"
                className="mb-4 mr-2"
                value={time}
                min={time}
                onChange={(e) => {
                  setTime(e.target.value);
                }}
              />
            </div>
            <p className="mb-4 text-center">{createPost.status !== "idle" ? createPost.status : ""}</p>
            {createPost.error?.data?.zodError ? (
              <p className="mb-4 text-center text-sm">
                {Object.entries(createPost.error.data.zodError.fieldErrors).map((fieldData, index) => (
                  <p key={index}>
                    {fieldData[0]}: {fieldData[1]}
                  </p>
                ))}
              </p>
            ) : (
              <></>
            )}
            <Button
              onClick={async () => {
                const utcTime = moment(time).utc().toDate();
                try {
                  await createPost.mutateAsync({ title, content, emails, duration, time: utcTime });
                  await utils.room.getCreatedUpcoming.invalidate();
                } catch (e) {
                  console.error(e);
                }
                setTitle("");
                setContent("");
                setEmail("");
                setEmails([]);
              }}
            >
              Create
            </Button>
          </form>
        </Card>
        <Link href="/">
          <Button variant={"link"}>back</Button>
        </Link>
      </div>
      <Footer />
    </>
  );
}
