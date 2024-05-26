'use client';
import React, { useEffect } from 'react';

import { useMadison } from '@/contexts/MadisonContext';

export default function Page({ params }) {
  const { currentRun } = useMadison();

  const { id } = params;

  useEffect(() => {
    const checkForMessages = async (run) => {
      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(run.thread_id);
        for (const message of messages.data.reverse()) {
          console.log(`${message.role} > ${message.content[0].text.value}`);
        }
      } else {
        console.log(run.status);
      }
    };

    currentRun && checkForMessages(currentRun);
  }, [currentRun]);

  /*
          await setDoc(doc(db, 'chats', userId, chatId, messageId), {
          text: 'Hello, how can I help you?',
        }); */

  return (
    <div>
      <p>Chat Page</p>
      <p>Chat ID: {id}</p>
    </div>
  );
}
