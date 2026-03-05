import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold mb-8">Chat</h1>
      <Chat />
    </div>
  );
}
