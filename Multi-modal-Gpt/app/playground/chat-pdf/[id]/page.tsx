"use client"
import React from "react";
import Panels from "./_include/panels";

type Props = {
    params: {
        id: string;
    }
}

const ChatWithPdf = ({params}: Props) => {
      const [chatId, setChatId] = React.useState<string>("");

      React.useEffect(() => {
        if (params.id) {
          setChatId(params.id);
        }
      }, [params.id]);
    return (
      <div>
        <Panels chatId={chatId} setChatId={setChatId} />
      </div>
    );
};

export default ChatWithPdf;
