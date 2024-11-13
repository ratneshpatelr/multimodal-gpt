import PlaygroundGrid from "~/components/playground-grid-v1";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const PlaygroundPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <>
      <PlaygroundGrid />
    </>
  );
};

export default PlaygroundPage;
