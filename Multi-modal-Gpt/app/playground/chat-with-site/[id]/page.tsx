"use client"

import React from "react";
import WebsiteScrapper from "./_includes/WebsiteScrapper";

type Props = {
  params: {
    id: string;
  };
};

export default function page({ params: { id } }: Props) {
  const [chatId, setChatId] = React.useState<string>("");

  React.useEffect(() => {
    
    if (id) {
      setChatId(id);
    }
  }, [id]);
  return (
    <>
      <WebsiteScrapper chatId={chatId} setChatId={setChatId} />
    </>
  );
}
